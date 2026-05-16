import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { ProductsSection } from "@/components/site/ProductsSection";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Anime Figures — Morfyx Studio" },
      { name: "description", content: "Browse premium anime figures, resin statues and limited collector drops." },
      { property: "og:title", content: "Shop — Morfyx Studio" },
      { property: "og:description", content: "Browse premium anime figures, resin statues and limited drops." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Shop" title="Every figure, one collection" desc="Hand-picked anime figures from across every legendary universe." />
      <ProductsSection
        eyebrow="Shop All"
        title="All products"
        desc="Browse every figure in the studio vault."
      />
    </PageShell>
  );
}
