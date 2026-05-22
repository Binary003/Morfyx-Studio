import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { adminApi } from "../lib/api";

type OfferItem = {
    id: string;
    text: string;
};

const defaultOffers: OfferItem[] = [
    "Limited time: 15% off all imported figures",
    "Free shipping on orders over Rs. 2999",
    "Bundle deal: Buy 2 get 10% extra off",
    "New arrivals this week - shop now",
].map((text) => ({
    id: crypto.randomUUID(),
    text,
}));

const createOfferItem = (text = ""): OfferItem => ({
    id: crypto.randomUUID(),
    text,
});

export function OffersPage() {
    const [offers, setOffers] = useState<OfferItem[]>(defaultOffers);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadOffers = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getOffers();
                const items = response.data?.offerStrip?.items;

                if (Array.isArray(items) && items.length > 0) {
                    setOffers(items.map((text: string) => createOfferItem(text)));
                }
            } catch (err: any) {
                setError(err.message || "Failed to load offers");
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    const updateOffer = (id: string, value: string) => {
        setOffers((prev) => prev.map((item) => (item.id === id ? { ...item, text: value } : item)));
    };

    const addOffer = () => {
        setOffers((prev) => [...prev, createOfferItem()]);
    };

    const removeOffer = (id: string) => {
        setOffers((prev) => prev.filter((item) => item.id !== id));
    };

    const saveOffers = async () => {
        const cleanedOffers = offers.map((offer) => offer.text.trim()).filter(Boolean);

        if (cleanedOffers.length === 0) {
            setError("Add at least one offer before saving.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");
            const response = await adminApi.updateOffers({ items: cleanedOffers });
            const items = (response as any)?.data?.offerStrip?.items;
            setOffers(
                Array.isArray(items) && items.length > 0
                    ? items.map((text: string) => createOfferItem(text))
                    : cleanedOffers.map((text) => createOfferItem(text))
            );
            setSuccess("Offer strip updated successfully.");
        } catch (err: any) {
            setError(err.message || "Failed to save offers");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <SectionHeader
                    title="Offers & Banners"
                    subtitle="Schedule banners, festival promos, and offer strips."
                />
                <div className="mt-6 text-center">Loading offers...</div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHeader
                title="Offers & Banners"
                subtitle="Schedule banners, festival promos, and offer strips."
                action={<Button onClick={addOffer}>Add Offer Line</Button>}
            />

            {error ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {offers.slice(0, 3).map((title, index) => (
                    <Card key={title.id}>
                        <CardHeader>
                            <CardTitle>{title.text}</CardTitle>
                            <p className="text-xs text-mutedForeground">Live offer line {index + 1}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border/60 bg-card/60 p-3 text-xs text-mutedForeground">
                                This text will move across the storefront offer strip.
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Offer Strip Text</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {offers.map((offer, index) => (
                            <div key={offer.id} className="flex gap-2">
                                <Input
                                    value={offer.text}
                                    onChange={(event) => updateOffer(offer.id, event.target.value)}
                                    placeholder={`Offer line ${index + 1}`}
                                />
                                <Button type="button" variant="secondary" onClick={() => removeOffer(offer.id)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button onClick={saveOffers} disabled={saving}>
                            {saving ? "Saving..." : "Save Offers"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
