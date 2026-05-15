import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Collections } from "@/components/site/Collections";
import { Trending } from "@/components/site/Trending";
import { LimitedEdition } from "@/components/site/LimitedEdition";
import { ImportedCollection } from "@/components/site/ImportedCollection";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { Showcase3D } from "@/components/site/Showcase3D";
import { WhyUs } from "@/components/site/WhyUs";
import { Testimonials } from "@/components/site/Testimonials";
import { Footer } from "@/components/site/Footer";
import { CursorGlow } from "@/components/site/CursorGlow";
import { ScrollProgress } from "@/components/site/ScrollProgress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OtakuForge 3D — Premium Anime Figures & Custom Collectibles" },
      { name: "description", content: "Premium anime figures, imported Japanese collectibles & custom commissioned statues. Hand-painted, collector-grade, shipped worldwide." },
      { property: "og:title", content: "OtakuForge 3D — Premium Anime Figures" },
      { property: "og:description", content: "Bring your anime universe to reality with collector-grade resin figures and bespoke custom commissions." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Collections />
        <LimitedEdition />
        <Trending />
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
