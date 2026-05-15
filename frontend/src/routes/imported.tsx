import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ImportedCollection } from "@/components/site/ImportedCollection";
import { FeaturedCarousel } from "@/components/site/FeaturedCarousel";
import { WhyUs } from "@/components/site/WhyUs";

export const Route = createFileRoute("/imported")({
  head: () => ({
    meta: [
      { title: "Imported Anime Figures From Japan — OtakuForge 3D" },
      { name: "description", content: "Authentic anime figures imported directly from Japanese studios. 100% genuine, certified, sealed." },
      { property: "og:title", content: "Imported Collection — OtakuForge 3D" },
      { property: "og:description", content: "Authentic anime figures imported directly from Japan." },
    ],
  }),
  component: ImportedPage,
});

function ImportedPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Imported · Tokyo · Osaka" title="Authentic figures from Japan" desc="Officially licensed pieces, sealed, certified, and shipped worldwide." />
      <ImportedCollection />
      <FeaturedCarousel />
      <WhyUs />
    </PageShell>
  );
}
