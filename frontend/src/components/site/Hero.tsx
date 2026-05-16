import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import heroFigure from "@/assets/hero-figure.jpg";
import { useCustomFigureModal } from "./CustomFigureModal";

export function Hero() {
  const { open } = useCustomFigureModal();
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Animated gradient backdrop */}
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />

      {/* Floating particles */}
      <Particles />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-accent mb-8"
          >
            <Sparkles className="h-3 w-3" />
            New Drop · Limited Edition
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]"
          >
            Bring Your Anime <br />
            Universe To <span className="text-gradient-neon">Reality</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl"
          >
            Premium anime figures, official imports, and bespoke
            custom statues — crafted in India and shipped across the country.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#collections"
              className="group relative inline-flex items-center gap-2 rounded-full bg-[var(--gradient-neon)] px-7 py-3.5 font-semibold text-primary-foreground glow-pink hover:scale-105 transition"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </a>
            <button
              onClick={open}
              className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 font-semibold hover:glow-pink transition"
            >
              <Wand2 className="h-4 w-4 text-accent" />
              Request Custom Figure
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { v: "12K+", l: "Collectors" },
              { v: "850+", l: "Figures" },
              { v: "60+", l: "Cities" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl font-bold text-gradient-neon">{s.v}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero figure */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-[var(--gradient-neon)] opacity-30 blur-3xl rounded-full animate-pulse-glow" />
          <div className="relative glass rounded-3xl overflow-hidden neon-border">
            <div
              className="absolute inset-0 opacity-60 mix-blend-screen"
              style={{ background: "var(--gradient-hero)" }}
            />
            <img
              src={heroFigure}
              alt="Premium cyberpunk anime figure"
              width={1536}
              height={1536}
              className="relative w-full h-auto object-cover"
            />
            {/* Floating stat chips */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-6 left-6 glass rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <span className="text-accent">●</span> Live 3D Preview
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-6 right-6 glass rounded-2xl p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Resin Grade</div>
              <div className="font-display text-lg text-gradient-neon">AAA+</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          Scroll ↓
        </motion.div>
      </div>
    </section>
  );
}

function Particles() {
  const dots = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {dots.map((_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const size = (i % 4) + 2;
        const delay = (i % 8) * 0.4;
        const isPink = i % 2 === 0;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -40, 0] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay }}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: isPink ? "var(--neon-pink)" : "var(--neon-cyan)",
              boxShadow: `0 0 ${size * 3}px currentColor`,
              color: isPink ? "var(--neon-pink)" : "var(--neon-cyan)",
            }}
          />
        );
      })}
    </div>
  );
}
