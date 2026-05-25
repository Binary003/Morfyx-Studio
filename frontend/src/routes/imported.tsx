import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ImportedCollection } from "@/components/site/ImportedCollection";
import { ProductsSection } from "@/components/site/ProductsSection";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { WhyUs } from "@/components/site/WhyUs";

export const Route = createFileRoute("/imported")({
  head: () => ({
    meta: [
      { title: "Premium Collection — Morfyx Studio" },
      { name: "description", content: "Premium anime figures curated and verified in India for collectors." },
      { property: "og:title", content: "Premium Collection — Morfyx Studio" },
      { property: "og:description", content: "Premium anime figures curated and verified in India for collectors." },
    ],
  }),
  component: ImportedPage,
});

function ImportedPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Premium · India Curated" title="Authentic premium figures" desc="Officially licensed pieces, sealed, certified, and shipped across India." />
      <ImportedCollection />
      <ProductsSection
        eyebrow="Premium Vault"
        title="Exclusive premium releases"
        desc="Curated figures from official studios. Tap any figure for full details."
        productType="imported"
      />
      <FeaturedCarousel />
      <WhyUs />
    </PageShell>
  );
}
