import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { Trending } from "@/components/site/Trending";
import { Collections } from "@/components/site/Collections";
import { LimitedEdition } from "@/components/site/LimitedEdition";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Anime Figures — OtakuForge 3D" },
      { name: "description", content: "Browse premium anime figures, resin statues and limited collector drops." },
      { property: "og:title", content: "Shop — OtakuForge 3D" },
      { property: "og:description", content: "Browse premium anime figures, resin statues and limited drops." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Shop" title="Every figure, one collection" desc="Hand-picked anime figures from across every legendary universe." />
      <Trending />
      <Collections />
      <LimitedEdition />
    </PageShell>
  );
}
