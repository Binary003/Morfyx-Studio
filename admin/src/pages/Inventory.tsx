import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";

const inventory = [
  { label: "Naruto", value: 78 },
  { label: "One Piece", value: 64 },
  { label: "Tokyo Ghoul", value: 36 },
  { label: "Demon Slayer", value: 82 },
];

export function InventoryPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <SectionHeader
        title="Inventory"
        subtitle="Track stock levels, restocks, and alerts."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {inventory.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs text-mutedForeground">
                <span>Stock</span>
                <span>{item.value}%</span>
              </div>
              <Progress value={item.value} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-card/60 p-3">Kaneki Black Requiem - 5 units left</div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-3">Luffy Gear Fifth Aura - 8 units left</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
