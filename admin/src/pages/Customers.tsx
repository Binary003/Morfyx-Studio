import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { adminApi } from "../lib/api";

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    orderHistory: any[];
    createdAt: string;
}

export function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getCustomers();
                setCustomers(response.data?.items || []);
            } catch (err: any) {
                setError(err.message || "Failed to load customers");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader title="Customers" subtitle="Monitor customer lifetime value and activity." />
                <div className="mt-6 text-center">Loading customers...</div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader title="Customers" subtitle="Monitor customer lifetime value and activity." />
                <div className="mt-6 text-center text-red-600">{error}</div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Customers"
                subtitle={`Monitoring ${customers.length} registered customers`}
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                {customers.slice(0, 3).map((customer) => (
                    <Card key={customer._id}>
                        <CardContent className="py-5">
                            <div className="text-lg font-semibold">{customer.name}</div>
                            <div className="text-xs text-mutedForeground">{customer.email}</div>
                            <div className="mt-3 flex items-center gap-2">
                                <Badge variant={customer.orderHistory.length > 3 ? "success" : "default"}>
                                    {customer.orderHistory.length} orders
                                </Badge>
                                <span className="text-xs text-mutedForeground">Active</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-6">
                <CardContent className="overflow-hidden">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>Orders</TableHeaderCell>
                                <TableHeaderCell>Joined</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer._id}>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.orderHistory.length}</TableCell>
                                    <TableCell>
                                        {new Date(customer.createdAt).toLocaleDateString()}
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
