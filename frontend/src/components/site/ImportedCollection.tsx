import { motion } from "framer-motion";
import { Plane, ShieldCheck, Award } from "lucide-react";
import { SectionHead } from "./Collections";
import p1 from "@/assets/prod-2.jpg";
import p2 from "@/assets/prod-4.jpg";

const features = [
  { icon: Plane, t: "Direct from Japan", d: "Sourced straight from Tokyo & Osaka studios." },
  { icon: ShieldCheck, t: "100% Authentic", d: "Certificate of authenticity with every piece." },
  { icon: Award, t: "Studio Grade", d: "Bandai, Good Smile, Aniplex & boutique sculptors." },
];

export function ImportedCollection() {
  return (
    <section id="imported" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Imported Collection" title="Authentic figures, flown in from Japan" desc="Hand-selected pieces from official Japanese studios — verified, sealed, and shipped to your door." />

        <div className="mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden glass neon-border min-h-[500px]"
          >
            <img src={p1} alt="Imported anime figure" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-[var(--gradient-neon)] text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 glow-pink">
              🇯🇵 Imported · Tokyo
            </div>
            <div className="absolute bottom-0 inset-x-0 p-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-accent">Featured Import</div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold mt-2">Rem — Wedding Ver. 1/7 Scale</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Officially licensed by Good Smile Company. Sealed in original packaging.</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="font-display text-3xl font-bold text-gradient-neon">₹429</div>
                <button className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:glow-pink transition flex gap-4 items-start"
              >
                <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground glow-pink">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-bold">{f.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{f.d}</div>
                </div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden flex-1 min-h-[200px] glass neon-border"
            >
              <img src={p2} alt="Import" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">200+ imports in stock</div>
                <div className="font-display text-2xl font-bold mt-1">Browse Imports →</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
