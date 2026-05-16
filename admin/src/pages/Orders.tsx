import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { orders as seedOrders } from "../data/mock";

const statusMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    pending: "warning",
    processing: "info",
    packed: "info",
    shipped: "success",
    delivered: "success",
    cancelled: "danger",
};

const paymentMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    paid: "success",
    pending: "warning",
    failed: "danger",
    refunded: "info",
};

export function OrdersPage() {
    const [items, setItems] = useState(seedOrders);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = useMemo(() => {
        return items.filter((order) => {
            const matchesSearch = order.customer.toLowerCase().includes(search.toLowerCase()) || order.id.toLowerCase().includes(search.toLowerCase());
            const matchesDate = dateFilter ? order.createdAt === dateFilter : true;
            const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [dateFilter, items, search, statusFilter]);

    const updateStatus = (id: string, status: string) => {
        setItems((prev) => prev.map((order) => (order.id === id ? { ...order, status: status as typeof order.status } : order)));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Orders"
                subtitle="Search by customer or date and update order status in one place."
            />

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="Search by customer or order ID"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <Input
                            type="date"
                            value={dateFilter}
                            onChange={(event) => setDateFilter(event.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </Select>
                    </div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Order</TableHeaderCell>
                                <TableHeaderCell>Customer</TableHeaderCell>
                                <TableHeaderCell>Date</TableHeaderCell>
                                <TableHeaderCell>Total</TableHeaderCell>
                                <TableHeaderCell>Payment</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.createdAt}</TableCell>
                                    <TableCell>Rs. {order.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={paymentMap[order.paymentStatus]}>{order.paymentStatus}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusMap[order.status]}>{order.status}</Badge>
                                            <Select
                                                value={order.status}
                                                onChange={(event) => updateStatus(order.id, event.target.value)}
                                                className="max-w-[140px]"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="packed">Packed</option>
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
