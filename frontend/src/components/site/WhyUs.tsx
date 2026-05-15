import { motion } from "framer-motion";
import { Gem, Brush, Truck, Package, Crown, ShieldCheck } from "lucide-react";
import { SectionHead } from "./Collections";

const items = [
  { icon: Gem, t: "Premium Resin Quality", d: "Studio-grade resin sculpts engineered to last decades." },
  { icon: Brush, t: "Hand-Painted Detail", d: "Every figure finished by master artisans, never mass-painted." },
  { icon: Truck, t: "Global Shipping", d: "Insured delivery to 60+ countries with full tracking." },
  { icon: Package, t: "Collector Packaging", d: "Magnetic-close boxes, foam cradles, certificate of authenticity." },
  { icon: Crown, t: "Limited Editions", d: "Numbered runs that hold and grow their value." },
  { icon: ShieldCheck, t: "Secure Payments", d: "256-bit encrypted checkout and buyer protection." },
];

export function WhyUs() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Why OtakuForge"
          title="Built for true collectors"
          desc="Six reasons our figures end up in display cases, not boxes."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/30 transition" />
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground glow-pink group-hover:animate-pulse-glow">
                  <it.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-bold mt-5">{it.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{it.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
