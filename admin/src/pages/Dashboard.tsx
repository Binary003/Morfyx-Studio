import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { StatCard } from "../components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart } from "../components/charts/BarChart";
import { LineChart } from "../components/charts/LineChart";
import { RadialChart } from "../components/charts/RadialChart";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ToastRail } from "../components/feedback/ToastRail";
import { orders, statCards } from "../data/mock";

const revenueData = [12, 20, 18, 28, 24, 36, 30, 40];
const salesData = [14, 20, 12, 30, 26, 18, 28, 34, 30, 38, 42, 46];

const statusMap: Record<string, "info" | "success" | "warning" | "danger"> = {
  pending: "warning",
  processing: "info",
  packed: "info",
  shipped: "success",
  delivered: "success",
  cancelled: "danger",
};

export function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Dashboard"
        subtitle="Realtime performance overview across sales, inventory, and customer activity."
        action={<Button>Generate Report</Button>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} trend={card.trend} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Flow</CardTitle>
            <p className="text-xs text-mutedForeground">Weekly gross revenue with neon pulse overlays.</p>
          </CardHeader>
          <CardContent>
            <LineChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <p className="text-xs text-mutedForeground">Storefront conversion performance.</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <RadialChart value={72} />
            <div className="text-xs text-mutedForeground">Target: 80% by end of month</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <p className="text-xs text-mutedForeground">Current fiscal year performance.</p>
          </CardHeader>
          <CardContent>
            <BarChart data={salesData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <p className="text-xs text-mutedForeground">Latest transactions and statuses.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>Rs. {order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusMap[order.status]}>{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <div className="text-sm text-mutedForeground">This month</div>
              <div className="text-2xl font-semibold">One Piece</div>
              <div className="text-xs text-neonCyan">+18.4% sales lift</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customer Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Active VIPs</span>
                <span className="text-neonPink">128</span>
              </div>
              <div className="flex justify-between">
                <span>Returning Users</span>
                <span className="text-neonCyan">42%</span>
              </div>
              <div className="flex justify-between">
                <span>Wishlist Adds</span>
                <span className="text-neonPurple">312</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ToastRail />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
