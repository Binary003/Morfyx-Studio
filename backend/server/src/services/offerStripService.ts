import { ApiError } from "../utils/apiError";
import { OfferStrip } from "../models/OfferStrip";

export const defaultOfferStripItems = [
    "Limited time: 15% off all imported figures",
    "Free shipping on orders over Rs. 2999",
    "Bundle deal: Buy 2 get 10% extra off",
    "New arrivals this week - shop now"
];

const normalizeOfferItems = (items: unknown) => {
    if (!Array.isArray(items)) {
        throw new ApiError(400, "Offer items must be an array");
    }

    const normalized = items
        .map((item) => String(item || "").trim())
        .filter(Boolean);

    if (normalized.length === 0) {
        throw new ApiError(400, "At least one offer is required");
    }

    return normalized;
};

export const getOfferStrip = async () => {
    let offerStrip = await OfferStrip.findOne({ key: "global" });

    if (!offerStrip) {
        offerStrip = await OfferStrip.create({
            key: "global",
            items: defaultOfferStripItems,
            isActive: true
        });
    }

    return offerStrip;
};

export const updateOfferStrip = async (items: unknown) => {
    const normalizedItems = normalizeOfferItems(items);

    return OfferStrip.findOneAndUpdate(
        { key: "global" },
        {
            key: "global",
            items: normalizedItems,
            isActive: true
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};