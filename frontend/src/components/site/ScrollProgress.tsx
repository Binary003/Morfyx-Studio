import { motion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{ scaleX: scrollYProgress }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100]"
    >
      <div className="h-full w-full bg-[var(--gradient-neon)] glow-pink" />
    </motion.div>
  );
}
