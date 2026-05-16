import { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { OffersStrip } from "@/components/site/OffersStrip";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <CursorGlow />
      <OffersStrip />
      <Navbar withOfferStrip />
      <main className="relative z-10 pt-40">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <section className="relative py-12 sm:py-20">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-accent">
          {eyebrow}
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold mt-5">
          {title.split(" ").map((w, i, arr) =>
            i === arr.length - 1 ? <span key={i} className="text-gradient-neon"> {w}</span> : <span key={i}>{i ? " " : ""}{w}</span>
          )}
        </h1>
        {desc && <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{desc}</p>}
      </div>
    </section>
  );
}
