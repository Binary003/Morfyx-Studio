import { Instagram, Twitter, Youtube, Send, MessageCircle } from "lucide-react";

const cols = [
  { t: "Shop", links: ["New Arrivals", "Bestsellers", "Limited Editions", "Imported Collection"] },
  { t: "Brand", links: ["About Us", "Craftsmanship", "Studio", "Press"] },
  { t: "Support", links: ["Shipping", "Returns", "FAQ", "Contact"] },
  { t: "Collectors", links: ["Custom Figures", "Membership", "Authenticity"] },
];

export function Footer() {
  return (
    <footer className="relative pt-20 pb-10 mt-10 border-t border-border/50">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-[var(--gradient-neon)] opacity-60" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="glass rounded-3xl p-8 sm:p-12 neon-border grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-accent">Join the forge</div>
            <h3 className="font-display text-3xl sm:text-4xl font-bold mt-3">
              Early access to <span className="text-gradient-neon">limited drops</span>
            </h3>
            <p className="text-muted-foreground mt-3">
              First dibs on new figures, collector previews, and members-only pricing.
            </p>
          </div>
          <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="you@morfyxstudio.in"
              className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-3.5 outline-none focus:border-accent"
            />
            <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-neon)] px-5 py-3.5 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
              <Send className="h-4 w-4" /> Join
            </button>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-[var(--gradient-neon)] grid place-items-center font-bold text-primary-foreground glow-pink">M</div>
              <div>
                <div className="font-display text-xl font-bold">Morfyx <span className="text-gradient-neon">Studio</span></div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">India Studio</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm">
              Premium anime figures and custom 3D collectibles crafted in India — shipped across the country from our single studio.
            </p>
            <div className="flex gap-2 mt-6">
              {[Instagram, Twitter, Youtube, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg glass grid place-items-center hover:glow-cyan transition">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <div className="text-xs uppercase tracking-[0.25em] text-accent mb-4">{c.t}</div>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Morfyx Studio · All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
