import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const defaultOffers = [
    "Limited time: 15% off all imported figures",
    "Free shipping on orders over Rs. 2999",
    "Bundle deal: Buy 2 get 10% extra off",
    "New arrivals this week - shop now",
];

export function OffersStrip() {
    const [offers, setOffers] = useState(defaultOffers);

    useEffect(() => {
        let active = true;

        const loadOffers = async () => {
            try {
                const response = await api.getOffers();
                const items = response.data?.offerStrip?.items;

                if (active && Array.isArray(items) && items.length > 0) {
                    setOffers(items);
                }
            } catch {
                // Keep the default strip text if the backend is unavailable.
            }
        };

        loadOffers();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-9 border-b border-border/60 bg-secondary/40 backdrop-blur-lg">
            <div
                className="flex h-full animate-marquee items-center gap-8 whitespace-nowrap px-4 text-[11px] uppercase tracking-[0.35em] text-muted-foreground"
                style={{ animationDirection: "reverse" }}
                aria-label="Latest offers"
            >
                {[...offers, ...offers, ...offers].map((offer, index) => (
                    <span key={`${offer}-${index}`} className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                        {offer}
                    </span>
                ))}
            </div>
        </div>
    );
}
