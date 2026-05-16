import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { WhyUs } from "@/components/site/WhyUs";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Morfyx Studio" },
      { name: "description", content: "Morfyx Studio is an India-based anime collectibles studio crafting figures for true collectors." },
      { property: "og:title", content: "About — Morfyx Studio" },
      { property: "og:description", content: "Premium anime collectibles studio." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageHero eyebrow="Our Story" title="Crafted in India for collectors" desc="Founded in India, Morfyx Studio blends master craftsmanship with cinematic anime obsession — one figure at a time." />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 prose prose-invert">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Morfyx Studio was founded by collectors, for collectors. Every figure that leaves our single studio in India is sculpted by hand,
            printed on studio-grade machines, and finished by master painters. We believe anime figures should be heirlooms — not just merchandise.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mt-6">
            From limited edition runs to fully bespoke commissions, our mission is to bring your favorite anime universes
            into reality with collector-grade precision and luxury packaging.
          </p>
        </div>
      </section>
      <WhyUs />
      <Testimonials />
    </PageShell>
  );
}
