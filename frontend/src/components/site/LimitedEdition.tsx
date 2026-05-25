import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown, Timer } from "lucide-react";
import { toast } from "sonner";
import { SectionHead } from "./Collections";
import { formatPrice, useAllProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function LimitedEdition() {
  const { addItem } = useCart();
  const { data: products } = useAllProducts();

  const drops = useMemo(() => {
    return [...products]
      .sort((left, right) => (right.price || 0) - (left.price || 0))
      .slice(0, 3);
  }, [products]);

  const handleReserve = (product: Product) => {
    const added = addItem(product);
    if (added) {
      toast.success(`${product.name} reserved in cart.`, { duration: 1400 });
    }
  };

  if (drops.length === 0) {
    return null;
  }

  return (
    <section id="limited" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Limited Edition" title="Numbered drops, never restocked" desc="Once they're gone, they're gone. Every figure is individually numbered with a certificate of authenticity." />

        <div className="mt-16 grid lg:grid-cols-3 gap-6">
          {drops.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl overflow-hidden glass neon-border"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={d.img} alt={d.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--gradient-neon)] text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 glow-pink">
                  <Crown className="h-3 w-3" /> Limited
                </span>
                <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider">
                  <Timer className="h-3 w-3 text-accent" /> Selling fast
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">Top priced pick</div>
                <h3 className="font-display text-2xl font-bold mt-2">{d.name}</h3>
                <div className="flex items-end justify-between mt-4">
                  <div className="font-display text-3xl font-bold text-gradient-neon">{formatPrice(d.price)}</div>
                  <button
                    type="button"
                    onClick={() => handleReserve(d)}
                    className="rounded-full bg-[var(--gradient-neon)] px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
                  >
                    Reserve
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
