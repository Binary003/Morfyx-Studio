import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHead } from "./Collections";

const reviews = [
  { name: "Hiro T.", role: "Collector · Tokyo", text: "The detail on my Yumi figure is insane. Better than studio releases I own — and the packaging feels luxury.", rating: 5 },
  { name: "Marcus L.", role: "Collector · Berlin", text: "My imported Rem arrived sealed and pristine. The authenticity certificate sealed the deal — pure quality.", rating: 5 },
  { name: "Aiko R.", role: "Collector · Osaka", text: "I commissioned a custom build via WhatsApp. The sculptors nailed my OC in two iterations. Worth every yen.", rating: 5 },
  { name: "Diego F.", role: "Collector · Mexico", text: "Easily the centerpiece of my display shelf. The resin glow under lights is unreal.", rating: 5 },
  { name: "Sara K.", role: "Collector · London", text: "The translucent resin glows under display lights. It's the centerpiece of my room now.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Loved by collectors"
          title="Stories from the OtakuForge community"
        />
      </div>

      <div className="relative mt-16">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div className="flex gap-5 animate-marquee w-max">
          {[...reviews, ...reviews].map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="w-[340px] sm:w-[380px] shrink-0 glass rounded-2xl p-6 relative"
            >
              <Quote className="h-6 w-6 text-accent/60 mb-3" />
              <p className="text-sm leading-relaxed">{r.text}</p>
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-[var(--gradient-neon)] grid place-items-center font-bold text-primary-foreground">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
