import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCustomFigureModal } from "./CustomFigureModal";
import naruto from "@/assets/col-naruto.jpg";
import onepiece from "@/assets/col-onepiece.jpg";
import dragonball from "@/assets/col-dragonball.jpg";
import demon from "@/assets/col-demon.jpg";
import aot from "@/assets/col-aot.jpg";
import jjk from "@/assets/col-jjk.jpg";

const collections = [
  { name: "Naruto", count: 64, img: naruto, accent: "from-orange-500/40 to-transparent" },
  { name: "One Piece", count: 52, img: onepiece, accent: "from-red-500/40 to-transparent" },
  { name: "Dragon Ball", count: 78, img: dragonball, accent: "from-yellow-400/40 to-transparent" },
  { name: "Demon Slayer", count: 41, img: demon, accent: "from-pink-500/40 to-transparent" },
  { name: "Attack on Titan", count: 33, img: aot, accent: "from-emerald-500/40 to-transparent" },
  { name: "Jujutsu Kaisen", count: 29, img: jjk, accent: "from-purple-500/40 to-transparent" },
];

export function Collections() {
  const { open } = useCustomFigureModal();
  return (
    <section id="collections" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Featured Collections"
          title="Forge your favorite universe"
          desc="Curated drops from every legendary anime — limited runs, collector-grade detail."
        />

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c, i) => (
            <motion.a
              key={c.name}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden glass neon-border"
            >
              <img
                src={c.img}
                alt={`${c.name} collection`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-t ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                    {c.count} items
                  </span>
                  <span className="h-9 w-9 rounded-full glass grid place-items-center group-hover:glow-pink transition">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-3xl font-bold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Explore collection →</p>
                </div>
              </div>
            </motion.a>
          ))}

          {/* Custom commissions CTA card */}
          <motion.button
            type="button"
            onClick={open}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -6 }}
            className="group relative aspect-[4/5] rounded-3xl overflow-hidden sm:col-span-2 lg:col-span-3 lg:aspect-[3/1] text-left"
            style={{ background: "var(--gradient-neon)" }}
          >
            <div className="absolute inset-0.5 rounded-3xl bg-background/90 grid place-items-center text-center p-10">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Bespoke Commission</div>
                <h3 className="font-display text-4xl sm:text-5xl font-bold mt-3">
                  Custom <span className="text-gradient-neon">Anime Figures</span>
                </h3>
                <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                  Any character, any pose. We sculpt, print, and hand-paint your dream figure.
                </p>
                <span className="inline-flex items-center gap-2 mt-6 rounded-full bg-[var(--gradient-neon)] px-6 py-3 font-semibold text-primary-foreground glow-pink group-hover:scale-105 transition">
                  Request Custom Figure <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl mx-auto"
    >
      <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </div>
      <h2 className="font-display text-4xl sm:text-5xl font-bold mt-5">
        {title.split(" ").map((w, i, arr) =>
          i === arr.length - 1 ? (
            <span key={i} className="text-gradient-neon">
              {" "}{w}
            </span>
          ) : (
            <span key={i}>{i ? " " : ""}{w}</span>
          )
        )}
      </h2>
      {desc && <p className="text-muted-foreground mt-4">{desc}</p>}
    </motion.div>
  );
}
