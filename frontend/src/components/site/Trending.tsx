import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag, Star, Box } from "lucide-react";
import { SectionHead } from "./Collections";
import p1 from "@/assets/prod-1.jpg";
import p2 from "@/assets/prod-2.jpg";
import p3 from "@/assets/prod-3.jpg";
import p4 from "@/assets/prod-4.jpg";

const products = [
  { name: "Kurogane Samurai — 1/6 Scale", price: 289, old: 349, rating: 4.9, badge: "−18%", img: p1 },
  { name: "Mecha Ascension Mk.II", price: 459, rating: 5.0, badge: "New", img: p2 },
  { name: "Shadow Ninja — Limited", price: 219, rating: 4.8, badge: "Hot", img: p3 },
  { name: "Neon Dragon — Resin Edition", price: 379, old: 429, rating: 4.9, badge: "−12%", img: p4 },
];

export function Trending() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Trending Now"
          title="Most coveted figures this drop"
          desc="Hand-picked by our collectors. Stocks vanish in hours."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="group glass rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary/50">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 glow-pink">
                  {p.badge}
                </span>

                {/* Quick action overlay */}
                <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition">
                  <IconBtn label="Wishlist"><Heart className="h-4 w-4" /></IconBtn>
                  <IconBtn label="Quick view"><Eye className="h-4 w-4" /></IconBtn>
                  <IconBtn label="3D View"><Box className="h-4 w-4" /></IconBtn>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-1 text-xs">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                  <span className="text-muted-foreground ml-1">{p.rating}</span>
                </div>
                <h3 className="font-medium leading-snug">{p.name}</h3>
                <div className="mt-auto flex items-end justify-between gap-3">
                  <div>
                    <div className="font-display text-2xl font-bold text-gradient-neon">${p.price}</div>
                    {p.old && (
                      <div className="text-xs text-muted-foreground line-through">${p.old}</div>
                    )}
                  </div>
                  <button
                    aria-label="Add to cart"
                    className="h-10 w-10 rounded-xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground hover:glow-pink transition active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="h-9 w-9 rounded-full glass grid place-items-center hover:glow-cyan transition"
    >
      {children}
    </button>
  );
}
