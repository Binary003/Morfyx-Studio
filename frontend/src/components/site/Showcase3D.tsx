import { motion } from "framer-motion";
import { Brush, Box, Sparkles, Wand2 } from "lucide-react";
import { SectionHead } from "./Collections";
import figure from "@/assets/col-naruto.jpg";

export function Showcase3D() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Handcrafted Process"
          title="See how every figure is built with detail"
          desc="From sculpting to paint finishing, each product is crafted by hand in India with collector-grade precision."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 relative rounded-3xl overflow-hidden glass neon-border"
        >
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            {/* Process image */}
            <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] bg-gradient-to-br from-secondary/40 to-background overflow-hidden">
              <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.6 }} />
              <div className="absolute inset-0 grid place-items-center p-6 sm:p-10">
                <div className="relative w-full max-w-[540px]">
                  <div className="absolute -inset-4 rounded-[2rem] border border-primary/20 bg-background/10 blur-2xl" />
                  <motion.img
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    src={figure}
                    alt="Handcrafted product showcase"
                    width={720}
                    height={720}
                    loading="lazy"
                    className="relative w-full rounded-[2rem] object-cover shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-background/85 backdrop-blur-md border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-accent">
                    Handmade 3D Finish
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-2xl bg-background/85 backdrop-blur-md border border-border/60 px-4 py-3 shadow-lg max-w-[220px]">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Surface detailing</div>
                    <div className="mt-1 text-sm font-semibold">Layered paint, crisp edges, premium display polish</div>
                  </div>
                </div>
              </div>

              {/* process chips */}
              <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                <Chip><Brush className="h-3 w-3" /> Hand Sculpted</Chip>
                <Chip><Box className="h-3 w-3" /> Resin Body</Chip>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end gap-4">
                <div className="flex gap-2">
                  <ActionChip><Wand2 className="h-3.5 w-3.5" /> Painted by Hand</ActionChip>
                  <ActionChip><Sparkles className="h-3.5 w-3.5" /> Collector Finish</ActionChip>
                </div>
                <Chip>Quality · Premium</Chip>
              </div>
            </div>

            {/* Spec panel */}
            <div className="p-8 lg:p-12 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-border/60">
              <div className="text-xs uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Crafting Highlights
              </div>
              <h3 className="font-display text-3xl font-bold leading-tight">
                Built for collectors who value detail
              </h3>
              <p className="text-muted-foreground">
                Every figure goes through careful sculpting, layered finishing, and a final quality check to ensure a premium display-ready look.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { k: "Stage 1", v: "3D sculpting" },
                  { k: "Stage 2", v: "Surface detailing" },
                  { k: "Stage 3", v: "Hand painting" },
                  { k: "Stage 4", v: "Final polish" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.k}</div>
                    <div className="font-display text-lg font-semibold mt-1">{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border/60">
                <div>
                  <div className="text-xs text-muted-foreground">Made to order</div>
                  <div className="font-display text-3xl font-bold text-gradient-neon">Premium craft</div>
                </div>
                <button className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
                  Explore Process
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5">
      {children}
    </span>
  );
}
function ActionChip({ children }: { children: React.ReactNode }) {
  return (
    <button className="glass rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:glow-cyan transition">
      {children}
    </button>
  );
}
