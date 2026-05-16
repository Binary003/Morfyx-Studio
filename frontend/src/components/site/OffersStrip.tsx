const offers = [
    "Limited time: 15% off all imported figures",
    "Free shipping on orders over Rs. 2999",
    "Bundle deal: Buy 2 get 10% extra off",
    "New arrivals this week - shop now",
];

export function OffersStrip() {
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
