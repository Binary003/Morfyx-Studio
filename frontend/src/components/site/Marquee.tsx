import { Star } from "lucide-react";

const items = [
  "Hand-Painted Resin",
  "Imported From Japan",
  "Limited Editions",
  "Collector Grade",
  "Custom Commissions",
  "Worldwide Shipping",
  "Premium Quality",
];

export function Marquee() {
  return (
    <div className="relative border-y border-border/50 overflow-hidden py-4 bg-secondary/20">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-muted-foreground">
            <Star className="h-3 w-3 text-accent fill-accent" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
