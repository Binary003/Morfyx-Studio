import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { customers } from "../data/mock";

export function CustomersPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Customers"
        subtitle="Monitor customer lifetime value and activity."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="py-5">
              <div className="text-lg font-semibold">{customer.name}</div>
              <div className="text-xs text-mutedForeground">{customer.email}</div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant={customer.status === "vip" ? "success" : "default"}>{customer.status}</Badge>
                <span className="text-xs text-mutedForeground">Rs. {customer.totalSpent.toLocaleString()}</span>
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
                <TableHeaderCell>Orders</TableHeaderCell>
                <TableHeaderCell>Total Spent</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>Rs. {customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "vip" ? "success" : "default"}>{customer.status}</Badge>
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
