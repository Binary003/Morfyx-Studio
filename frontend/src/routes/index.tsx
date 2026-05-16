import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Collections } from "@/components/site/Collections";
import { ProductsSection } from "@/components/site/ProductsSection";
import { LimitedEdition } from "@/components/site/LimitedEdition";
import { ImportedCollection } from "@/components/site/ImportedCollection";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { Showcase3D } from "@/components/site/Showcase3D";
import { WhyUs } from "@/components/site/WhyUs";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morfyx Studio — Premium Anime Figures & Custom Collectibles" },
      { name: "description", content: "Premium anime figures, official imports, and custom commissions. Hand-painted, collector-grade, shipped across India." },
      { property: "og:title", content: "Morfyx Studio — Premium Anime Figures" },
      { property: "og:description", content: "Bring your anime universe to reality with collector-grade resin figures and custom commissions crafted in India." },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Collections onSelectCategory={setActiveCategory} />
        <ProductsSection
          eyebrow="Products"
          title="Collector favorites"
          desc="Tap a figure to see full details, pricing, and add it to your cart."
          limit={4}
          activeCategory={activeCategory}
          onClearCategory={() => setActiveCategory(null)}
        />
        <LimitedEdition />
        <ImportedCollection />
        <FeaturedCarousel />
        <Showcase3D />
        <WhyUs />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
