import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart } from "../components/charts/LineChart";
import { BarChart } from "../components/charts/BarChart";
import { RadialChart } from "../components/charts/RadialChart";

export function AnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Analytics"
        subtitle="Deep insights into revenue, traffic, and anime category performance."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={[10, 18, 14, 26, 30, 34, 28, 40, 46]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <RadialChart value={68} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={[18, 22, 14, 28, 30, 36, 26, 34, 40, 44, 48, 52]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Anime Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Naruto</span><span>28%</span></div>
              <div className="flex justify-between"><span>One Piece</span><span>24%</span></div>
              <div className="flex justify-between"><span>Demon Slayer</span><span>18%</span></div>
              <div className="flex justify-between"><span>Tokyo Ghoul</span><span>12%</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
