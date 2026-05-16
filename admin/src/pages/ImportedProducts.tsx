import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const shipments = [
    { id: "IMP-001", source: "Osaka", eta: "6 days", status: "in transit" },
    { id: "IMP-002", source: "Seoul", eta: "12 days", status: "customs" },
    { id: "IMP-003", source: "Tokyo", eta: "3 days", status: "arriving" },
];

export function ImportedProductsPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Imported Products"
                subtitle="Monitor overseas shipments and imported inventory status."
                action={<Button>Add Imported Product</Button>}
            />

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {shipments.map((ship) => (
                    <Card key={ship.id}>
                        <CardHeader>
                            <CardTitle>{ship.id}</CardTitle>
                            <p className="text-xs text-mutedForeground">Source: {ship.source}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">ETA: {ship.eta}</div>
                            <Badge variant="info" className="mt-3">{ship.status}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Import Batch Tracking</CardTitle>
                </CardHeader>
                <CardContent className="overflow-hidden">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Batch</TableHeaderCell>
                                <TableHeaderCell>Origin</TableHeaderCell>
                                <TableHeaderCell>Customs</TableHeaderCell>
                                <TableHeaderCell>Availability</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shipments.map((ship) => (
                                <TableRow key={ship.id}>
                                    <TableCell>{ship.id}</TableCell>
                                    <TableCell>{ship.source}</TableCell>
                                    <TableCell>Rs. 1.4L</TableCell>
                                    <TableCell>
                                        <Badge variant="success">In Stock</Badge>
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
