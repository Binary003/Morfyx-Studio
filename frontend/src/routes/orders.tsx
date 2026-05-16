import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "My Orders — Morfyx Studio" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <PageShell>
      <PageHero eyebrow="Account" title="My Orders" desc="Track current orders and revisit past collectibles." />

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {!isAuthenticated ? (
            <div className="glass neon-border rounded-3xl p-8 text-center">
              <div className="text-lg font-semibold">Please log in to view your orders.</div>
              <div className="text-sm text-muted-foreground mt-2">We need your account to load order history.</div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center mt-6 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="glass neon-border rounded-3xl p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Signed in as</div>
              <div className="text-lg font-semibold mt-2">{user?.name}</div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground uppercase tracking-wider text-[10px]">
                    <tr><th className="py-3">Order</th><th>Item</th><th>Status</th><th className="text-right">Total</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      ["#20401", "Rem Wedding Ver.", "Delivered", "$429"],
                      ["#20400", "Kurogane Samurai 1/6", "Shipped", "$289"],
                      ["#20392", "Domain Expansion Diorama", "Processing", "$529"],
                    ].map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className={`py-3 ${j === 3 ? "text-right font-display text-gradient-neon font-bold" : ""}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
