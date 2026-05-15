import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Package, Upload, MessageSquare, BarChart3, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — OtakuForge 3D" },
      { name: "description", content: "OtakuForge 3D admin control center (placeholder)." },
    ],
  }),
  component: AdminPage,
});

const stats = [
  { v: "184", l: "Orders this week" },
  { v: "$48.2K", l: "Revenue (7d)" },
  { v: "27", l: "New enquiries" },
  { v: "12", l: "Custom in production" },
];

const tiles = [
  { icon: Package, t: "Order Management", d: "Track, fulfill and ship customer orders.", to: "/admin" as const },
  { icon: Upload, t: "Product Upload", d: "Add new figures, manage stock & editions.", to: "/admin" as const },
  { icon: MessageSquare, t: "Customer Enquiries", d: "Custom commissions & contact messages.", to: "/admin" as const },
  { icon: BarChart3, t: "Dashboard Analytics", d: "Sales, traffic and collector insights.", to: "/admin" as const },
];

function AdminPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Admin" title="OtakuForge control center" desc="Placeholder admin UI — order management, products, enquiries & analytics." />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5 neon-border">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gradient-neon">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-5">
          {tiles.map((t) => (
            <Link key={t.t} to={t.to} className="group glass rounded-3xl p-8 hover:glow-pink transition flex items-center justify-between gap-6">
              <div className="flex gap-5 items-center">
                <div className="h-14 w-14 rounded-2xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground glow-pink">
                  <t.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold">{t.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{t.d}</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-accent group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="glass neon-border rounded-3xl p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Recent Orders</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground uppercase tracking-wider text-[10px]">
                  <tr><th className="py-3">Order</th><th>Customer</th><th>Item</th><th>Status</th><th className="text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    ["#10231", "Hiro T.", "Yumi — Neon City", "Shipped", "$649"],
                    ["#10230", "Sara K.", "Kurogane Samurai 1/6", "Packing", "$289"],
                    ["#10229", "Marcus L.", "Custom Gojo Commission", "In Production", "$520"],
                    ["#10228", "Aiko R.", "Rem Wedding Ver.", "Delivered", "$429"],
                  ].map((r, i) => (
                    <tr key={i} className="py-3">
                      {r.map((c, j) => <td key={j} className={`py-3 ${j === 4 ? "text-right font-display text-gradient-neon font-bold" : ""}`}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
