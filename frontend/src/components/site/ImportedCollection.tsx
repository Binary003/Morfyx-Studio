import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Award } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SectionHead } from "./Collections";
import { useAllProducts } from "@/lib/products";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import p2 from "@/assets/prod-4.jpg";

const features = [
  { icon: Sparkles, t: "Premium Craftsmanship", d: "Handpicked premium figures from master craftsmen." },
  { icon: ShieldCheck, t: "100% Authentic", d: "Certificate of authenticity with every premium piece." },
  { icon: Award, t: "Collector Grade", d: "Limited edition and exclusive studio-grade figures." },
];

export function ImportedCollection() {
  const { data: products } = useAllProducts();
  const { addItem } = useCart();
  const [topProduct, setTopProduct] = useState<any>(null);

  useEffect(() => {
    if (products && products.length > 0) {
      const highest = products.reduce((max, product) =>
        (product.price > max.price) ? product : max
      );
      setTopProduct(highest);
    }
  }, [products]);

  const handleAddToCart = () => {
    if (topProduct) {
      const added = addItem(topProduct);
      if (added) {
        toast.success(`${topProduct.name} added to cart.`, { duration: 1400 });
      }
    }
  };

  return (
    <section id="imported" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="Premium Collection" title="Collector's showcase — Premium Edition" desc="Handcrafted premium figures, available exclusively in India. Each piece is a masterwork." />

        <div className="mt-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden glass neon-border aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[420px]"
          >
            {topProduct && (
              <>
                <div className="absolute inset-0 bg-secondary/40 p-3 sm:p-4">
                  <img src={topProduct.img} alt={topProduct.name} className="h-full w-full object-contain object-center" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-[var(--gradient-neon)] text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 glow-pink">
                  ⭐ Premium · India
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 lg:p-7">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-accent">{topProduct.category}</div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 leading-tight">{topProduct.name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-md line-clamp-3">{topProduct.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className={topProduct.stock !== undefined && topProduct.stock > 0 ? "text-green-400 text-xs font-semibold" : "text-destructive text-xs font-semibold"}>
                      {topProduct.stock !== undefined && topProduct.stock > 0 ? `In Stock (${topProduct.stock})` : "Out of Stock"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-neon">₹{topProduct.price}</div>
                    <button
                      onClick={handleAddToCart}
                      disabled={topProduct.stock !== undefined && topProduct.stock <= 0}
                      className="rounded-full bg-[var(--gradient-neon)] px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-pink hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </>
            )}
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
              <img src={p2} alt="Premium Collection" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <Link to="/imported" className="absolute bottom-0 inset-x-0 p-6 hover:brightness-110 transition">
                <div className="text-[10px] uppercase tracking-[0.3em] text-accent">Exclusive collection</div>
                <div className="font-display text-2xl font-bold mt-1">Browse Premiums →</div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
