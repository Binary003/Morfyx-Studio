import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { adminApi } from "../lib/api";

interface Order {
    _id: string;
    shipmentId?: string;
    customer: string;
    customerEmail?: string;
    orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
    paymentStatus: "pending" | "paid" | "failed";
    total: number;
    advanceAmount?: number;
    remainingCOD?: number;
    shipmentStatus?: string;
    trackingId?: string;
    deliveryDays?: number;
    itemCount?: number;
    createdAt: string;
    shippingInfo?: {
        name: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
    };
}

const statusMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    pending: "warning",
    paid: "info",
    processing: "info",
    shipped: "success",
    delivered: "success",
    cancelled: "danger",
};

const paymentMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    paid: "success",
    pending: "warning",
    failed: "danger",
};

const shipmentMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    "not_created": "warning",
    pending: "warning",
    picked: "info",
    shipped: "info",
    delivered: "success",
    cancelled: "danger",
};

const orderDateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function formatOrderDate(date: string) {
    return orderDateFormatter.format(new Date(date));
}

export function OrdersPage() {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(searchParams.get("orderId") || "");
    const [statusFilter, setStatusFilter] = useState("all");
    const [shipmentSaveState, setShipmentSaveState] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
    const orderRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    useEffect(() => {
        const orderId = searchParams.get("orderId");
        if (orderId) {
            setSearch(orderId);
        }
    }, [searchParams]);

    useEffect(() => {
        const orderId = searchParams.get("orderId");
        if (!orderId || loading) {
            return;
        }

        const row = orderRowRefs.current[orderId];
        if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [loading, orders, searchParams]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getOrders();
                setOrders(response.data?.items || []);
            } catch (err: any) {
                setError(err.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filtered = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.customer.toLowerCase().includes(search.toLowerCase()) ||
                order._id.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" ? true : order.orderStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [search, orders, statusFilter]);

    const updateStatus = async (id: string, orderStatus: string) => {
        try {
            await adminApi.updateOrder(id, { status: orderStatus });
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === id ? { ...order, orderStatus: orderStatus as Order["orderStatus"] } : order
                )
            );
        } catch (err) {
            console.error("Failed to update order status:", err);
        }
    };

    const updateShipmentDetails = async (orderId: string, shipmentStatus?: string, trackingId?: string, deliveryDays?: number) => {
        try {
            setShipmentSaveState((prev) => ({ ...prev, [orderId]: "saving" }));
            const currentOrder = orders.find((order) => order._id === orderId);
            const res = await adminApi.updateOrder(orderId, {
                status: currentOrder?.orderStatus,
                shipmentStatus,
                trackingId,
                deliveryDays,
            });
            const updated = (res as any)?.data?.order || (res as any)?.order || res;
            setOrders((prev) => prev.map((o) => o._id === orderId ? {
                ...o,
                orderStatus: updated?.orderStatus || o.orderStatus,
                shipmentStatus: updated?.shipmentStatus || shipmentStatus || o.shipmentStatus,
                trackingId: updated?.trackingId || trackingId || o.trackingId,
                deliveryDays: typeof updated?.deliveryDays === "number" ? updated.deliveryDays : deliveryDays ?? o.deliveryDays,
            } : o));
            setShipmentSaveState((prev) => ({ ...prev, [orderId]: "saved" }));
            window.setTimeout(() => {
                setShipmentSaveState((prev) => (prev[orderId] === "saved" ? { ...prev, [orderId]: "idle" } : prev));
            }, 1800);
        } catch (err) {
            console.error("Failed to update shipment details:", err);
            setShipmentSaveState((prev) => ({ ...prev, [orderId]: "error" }));
            const message = err instanceof Error ? err.message : "Failed to update shipment details.";
            alert(message);
        }
    };

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader title="Orders" subtitle="Search by customer or date and update order status in one place." />
                <div className="mt-6 text-center">Loading orders...</div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader title="Orders" subtitle="Search by customer or date and update order status in one place." />
                <div className="mt-6 text-center text-red-600">{error}</div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Orders"
                subtitle={`Managing ${filtered.length} orders`}
            />

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                    <div className="mb-4 grid gap-3 md:grid-cols-2">
                        <Input
                            placeholder="Search by customer or order ID"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </Select>
                    </div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Order ID</TableHeaderCell>
                                <TableHeaderCell>Customer</TableHeaderCell>
                                <TableHeaderCell>Delivery Address</TableHeaderCell>
                                <TableHeaderCell>Payment</TableHeaderCell>
                                <TableHeaderCell>Shipment</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((order) => (
                                <TableRow
                                    key={order._id}
                                    ref={(node) => {
                                        orderRowRefs.current[order._id] = node;
                                    }}
                                    className={searchParams.get("orderId") === order._id ? "bg-blue-500/10 ring-1 ring-blue-400/60" : undefined}
                                >
                                    <TableCell>
                                        <div className="text-xs font-mono">{order._id}</div>
                                        <div className="mt-1 text-[11px] text-gray-500">
                                            Ordered on {formatOrderDate(order.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{order.customer}</div>
                                        <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                                            {order.orderStatus}
                                        </div>
                                        <div className="text-xs text-gray-500">{order.customerEmail || 'N/A'}</div>
                                        <div className="text-xs text-gray-500 mt-1">📞 {order.shippingInfo?.phone || 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <div className="font-medium">{order.shippingInfo?.address || 'N/A'}</div>
                                            <div className="text-gray-500">{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.postalCode}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-semibold">₹{order.total?.toLocaleString()} Total</div>
                                            {order.advanceAmount ? (
                                                <>
                                                    <div className="text-xs text-green-600 font-medium">Paid: ₹{order.advanceAmount.toLocaleString()} (30%)</div>
                                                    <div className="text-xs text-blue-600 font-medium">COD: ₹{order.remainingCOD?.toLocaleString()} (70%)</div>
                                                </>
                                            ) : null}
                                            <Badge variant={paymentMap[order.paymentStatus]} className="mt-1">
                                                {order.paymentStatus}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={shipmentMap[order.shipmentStatus || "not_created"]}>
                                                    {order.shipmentStatus || "not_created"}
                                                </Badge>
                                                {shipmentSaveState[order._id] === "saving" && (
                                                    <span className="text-xs font-semibold text-blue-500">Saving...</span>
                                                )}
                                                {shipmentSaveState[order._id] === "saved" && (
                                                    <span className="text-xs font-semibold text-green-500">Saved</span>
                                                )}
                                                {shipmentSaveState[order._id] === "error" && (
                                                    <span className="text-xs font-semibold text-red-500">Save failed</span>
                                                )}
                                            </div>
                                            <div className="mt-2 space-y-2">
                                                <Input
                                                    placeholder="Tracking ID"
                                                    value={order.trackingId || ""}
                                                    onChange={(event) =>
                                                        setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, trackingId: event.target.value } : o))
                                                    }
                                                />
                                                <Select
                                                    value={order.shipmentStatus || "not_created"}
                                                    onChange={(event) =>
                                                        setOrders((prev) => prev.map((o) => o._id === order._id ? { ...o, shipmentStatus: event.target.value } : o))
                                                    }
                                                >
                                                    <option value="not_created">Not Created</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="picked">Picked</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </Select>
                                                <div>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Delivery days"
                                                        value={order.deliveryDays ?? ""}
                                                        onChange={(event) =>
                                                            setOrders((prev) => prev.map((o) => o._id === order._id ? {
                                                                ...o,
                                                                deliveryDays: event.target.value === "" ? undefined : Number(event.target.value),
                                                            } : o))
                                                        }
                                                    />
                                                    <div className="mt-1 text-[11px] text-gray-500">Shown to the customer as shipment in X days.</div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15 hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                                                    onClick={() => updateShipmentDetails(order._id, order.shipmentStatus, order.trackingId, order.deliveryDays)}
                                                    disabled={shipmentSaveState[order._id] === "saving"}
                                                >
                                                    {shipmentSaveState[order._id] === "saving"
                                                        ? "Saving"
                                                        : shipmentSaveState[order._id] === "saved"
                                                            ? "Saved"
                                                            : "Save Shipment Details"}
                                                </button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    );
}
