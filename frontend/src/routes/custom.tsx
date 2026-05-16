import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/site/PageShell";
import { useCustomFigureModal } from "@/components/site/CustomFigureModal";
import { Wand2, Brush, Box, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom Anime Figures — Morfyx Studio" },
      { name: "description", content: "Commission a bespoke anime figure. Any character, any pose — sculpted, printed and hand-painted by our master artisans." },
      { property: "og:title", content: "Custom Figures — Morfyx Studio" },
      { property: "og:description", content: "Commission a bespoke anime figure built to your specs." },
    ],
  }),
  component: CustomPage,
});

const steps = [
  { icon: MessageCircle, t: "Send Enquiry", d: "Share your character, pose, scale and reference images." },
  { icon: Brush, t: "Concept & Sculpt", d: "Our sculptors deliver a 3D preview within 7 days." },
  { icon: Box, t: "Print & Paint", d: "High-grade resin print, hand-painted by master artisans." },
  { icon: Wand2, t: "Delivered", d: "Insured, tracked, collector packaging worldwide." },
];

function CustomPage() {
  const { open } = useCustomFigureModal();
  useEffect(() => { open(); }, [open]);

  return (
    <PageShell>
      <PageHero eyebrow="Bespoke Commissions" title="Your dream anime figure" desc="Any character. Any pose. Sculpted to your vision and shipped worldwide." />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.t} className="glass rounded-2xl p-6 hover:glow-pink transition">
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Step 0{i + 1}</div>
                <div className="h-12 w-12 rounded-xl bg-[var(--gradient-neon)] grid place-items-center text-primary-foreground glow-pink mt-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-xl font-bold mt-4">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={open} className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-neon)] px-8 py-4 font-semibold text-primary-foreground glow-pink hover:scale-105 transition">
              <Wand2 className="h-4 w-4" /> Request Custom Figure
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
