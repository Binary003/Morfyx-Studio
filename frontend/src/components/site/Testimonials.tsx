import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHead } from "./Collections";

const reviews = [
  { name: "Raj Sharma", role: "Collector · Mumbai", text: "Morfyx Studio figures are next level! The hand-painted details on my Tanjiro figure are incredible. Worth every rupee.", rating: 5 },
  { name: "Priya Verma", role: "Collector · Delhi", text: "I ordered a custom commission through WhatsApp and the team nailed it. Delivery to Delhi was fast and packaging was pristine.", rating: 5 },
  { name: "Arjun Singh", role: "Collector · Bangalore", text: "Finally, premium anime figures made in India. The quality matches international studios but the customer support is unbeatable.", rating: 5 },
  { name: "Neha Patel", role: "Collector · Pune", text: "The imported figures are 100% authentic with certificates. My Rem figure is the crown jewel of my collection. Highly recommend!", rating: 5 },
  { name: "Vikram Desai", role: "Collector · Kolkata", text: "Ordered during Diwali sale and got an amazing deal. The resin glow under display lights is stunning. Best purchase ever!", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Loved by collectors"
          title="Join the Morfyx collectors family"
          desc="Real reviews from collectors across India who trust Morfyx Studio for premium anime figures."
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
