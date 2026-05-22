import { motion } from "framer-motion";
import { RotateCw, Maximize, Sparkles } from "lucide-react";
import { SectionHead } from "./Collections";
import figure from "@/assets/hero-figure.jpg";

export function Showcase3D() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="360° Showcase"
          title="Inspect every detail in 3D"
          desc="Rotate, zoom, and explore our flagship resin sculpts in real-time."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 relative rounded-3xl overflow-hidden glass neon-border"
        >
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            {/* Viewer */}
            <div className="relative aspect-square lg:aspect-auto lg:min-h-[600px] bg-gradient-to-br from-secondary/40 to-background overflow-hidden">
              <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.6 }} />
              {/* glowing rings */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border border-accent/30 animate-spin-slow" style={{ width: 480, height: 480, marginLeft: -240, marginTop: -240 }} />
                  <div className="absolute inset-0 rounded-full border border-primary/30" style={{ width: 380, height: 380, marginLeft: -190, marginTop: -190, animation: "spin 22s linear infinite reverse" }} />
                  <motion.img
                    animate={{ y: [0, -16, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    src={figure}
                    alt="3D figure showcase"
                    width={500}
                    height={500}
                    loading="lazy"
                    className="relative w-[340px] sm:w-[440px] drop-shadow-[0_30px_60px_rgba(255,0,180,0.35)]"
                  />
                </div>
              </div>

              {/* HUD chips */}
              <div className="absolute top-5 left-5 flex gap-2">
                <Chip><span className="h-2 w-2 rounded-full bg-accent animate-pulse" />LIVE</Chip>
                <Chip>Mesh · 1.2M tris</Chip>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end gap-4">
                <div className="flex gap-2">
                  <ActionChip><RotateCw className="h-3.5 w-3.5" /> Rotate</ActionChip>
                  <ActionChip><Maximize className="h-3.5 w-3.5" /> 360°</ActionChip>
                </div>
                <Chip>Lighting · Cinematic</Chip>
              </div>
            </div>

            {/* Spec panel */}
            <div className="p-8 lg:p-12 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-border/60">
              <div className="text-xs uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Flagship Drop
              </div>
              <h3 className="font-display text-3xl font-bold leading-tight">
                Yumi — Neon City Edition
              </h3>
              <p className="text-muted-foreground">
                A 1/6 scale resin masterpiece, hand-painted with iridescent pigments and
                LED-reactive base. Limited to 250 pieces worldwide.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { k: "Scale", v: "1/6" },
                  { k: "Material", v: "Premium Resin" },
                  { k: "Height", v: "32 cm" },
                  { k: "Edition", v: "250 / 250" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.k}</div>
                    <div className="font-display text-lg font-semibold mt-1">{s.v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border/60">
                <div>
                  <div className="text-xs text-muted-foreground">Pre-order</div>
                  <div className="font-display text-3xl font-bold text-gradient-neon">₹649</div>
                </div>
                <button className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
                  Reserve Now
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
