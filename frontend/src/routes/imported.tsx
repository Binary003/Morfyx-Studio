import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ImportedCollection } from "@/components/site/ImportedCollection";
import { ProductsSection } from "@/components/site/ProductsSection";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { WhyUs } from "@/components/site/WhyUs";

export const Route = createFileRoute("/imported")({
  head: () => ({
    meta: [
      { title: "Imported Anime Figures — Morfyx Studio" },
      { name: "description", content: "Authentic anime figures imported from official studios, curated and verified in India." },
      { property: "og:title", content: "Imported Collection — Morfyx Studio" },
      { property: "og:description", content: "Authentic anime figures imported from official studios and verified in India." },
    ],
  }),
  component: ImportedPage,
});

function ImportedPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Imported · India Curated" title="Authentic imported figures" desc="Officially licensed pieces, sealed, certified, and shipped across India." />
      <ImportedCollection />
      <ProductsSection
        eyebrow="Imported Vault"
        title="Exclusive imported releases"
        desc="Curated imports from official studios. Tap any figure for full details."
        productType="imported"
      />
      <FeaturedCarousel />
      <WhyUs />
    </PageShell>
  );
}
