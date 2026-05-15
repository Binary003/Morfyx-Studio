import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SectionHead } from "./Collections";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";

const slides = [
  { name: "Kurogane Samurai", tag: "Bestseller", price: 289, img: p1, desc: "1/6 scale resin masterpiece, hand-painted." },
  { name: "Mecha Ascension Mk.II", tag: "Just Dropped", price: 459, img: p2, desc: "Articulated alloy frame with LED core." },
  { name: "Shadow Ninja", tag: "Limited", price: 219, img: p3, desc: "Translucent resin, edition of 200." },
  { name: "Neon Dragon", tag: "Collector's Pick", price: 379, img: p4, desc: "Iridescent paintwork, mounted base." },
];

export function FeaturedCarousel() {
  const [i, setI] = useState(0);
  const next = () => setI((i + 1) % slides.length);
  const prev = () => setI((i - 1 + slides.length) % slides.length);
  const s = slides[i];

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Featured Drops" title="The collector's spotlight" />

        <div className="mt-16 relative rounded-3xl overflow-hidden glass neon-border min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 min-h-[500px]"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}
                  src={s.img} alt={s.name} className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.4 }} />
              </div>
              <div className="p-8 sm:p-12 flex flex-col justify-center gap-5">
                <div className="inline-flex w-fit items-center gap-2 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-accent">
                  {s.tag}
                </div>
                <h3 className="font-display text-4xl sm:text-5xl font-bold">{s.name}</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground">{s.desc}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="font-display text-4xl font-bold text-gradient-neon">${s.price}</div>
                  <button className="rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
                    Shop Now
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button onClick={prev} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass grid place-items-center hover:glow-pink transition z-10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass grid place-items-center hover:glow-pink transition z-10">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, j) => (
              <button key={j} onClick={() => setI(j)} aria-label={`Slide ${j + 1}`}
                className={`h-1.5 rounded-full transition-all ${j === i ? "w-8 bg-[var(--gradient-neon)]" : "w-1.5 bg-foreground/30"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
