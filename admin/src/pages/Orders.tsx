import { useEffect, useMemo, useState } from "react";
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

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

    const refreshShipment = async (orderId: string, shipmentId?: string) => {
        if (!shipmentId) return;
        try {
            const res = await adminApi.getShipment(shipmentId);
            const data = res.data || res;
            setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, shipmentStatus: data.status || data.shipmentStatus, trackingId: data.trackingNumber || o.trackingId } : o));
        } catch (err) {
            console.error("Failed to refresh shipment:", err);
        }
    };

    const createShipmentManually = async (orderId: string) => {
        try {
            const res = await adminApi.createShipment(orderId);
            const order = res?.data?.order;
            const shipment = res?.data?.shipment;
            setOrders((prev) => prev.map((o) => o._id === orderId
                ? {
                    ...o,
                    shipmentId: order?.shipmentId || shipment?.shipmentId || o.shipmentId,
                    trackingId: order?.trackingId || shipment?.trackingId || o.trackingId,
                    shipmentStatus: order?.shipmentStatus || "pending",
                    orderStatus: order?.orderStatus || o.orderStatus,
                }
                : o));
        } catch (err) {
            console.error("Failed to create shipment manually:", err);
            alert("Failed to create shipment. Please check Shiprocket credentials/logs.");
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
                                <TableHeaderCell>Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="text-xs font-mono">{order._id}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{order.customer}</div>
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
                                            {order.shipmentId ? (
                                                <>
                                                    <div className="font-mono text-xs">{order.trackingId || order.shipmentId}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={shipmentMap[order.shipmentStatus || "not_created"]}>
                                                            {order.shipmentStatus || "Not Created"}
                                                        </Badge>
                                                        <button className="text-xs text-blue-500 underline" onClick={() => refreshShipment(order._id, order.shipmentId)}>Refresh</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Badge variant={shipmentMap[order.shipmentStatus || "not_created"]}>
                                                        {order.shipmentStatus || "not_created"}
                                                    </Badge>
                                                    {order.paymentStatus === "paid" && (
                                                        <button
                                                            className="text-xs text-blue-500 underline"
                                                            onClick={() => createShipmentManually(order._id)}
                                                        >
                                                            Create Shipment
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusMap[order.orderStatus]}>
                                                {order.orderStatus}
                                            </Badge>
                                            <Select
                                                value={order.orderStatus}
                                                onChange={(event) => updateStatus(order._id, event.target.value)}
                                                className="max-w-[140px]"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </Select>
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
