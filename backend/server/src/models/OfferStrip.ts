import { Schema, model, Document } from "mongoose";

export interface OfferStripDocument extends Document {
    key: string;
    items: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const offerStripSchema = new Schema<OfferStripDocument>(
    {
        key: { type: String, required: true, unique: true, default: "global" },
        items: { type: [String], default: [] },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const OfferStrip = model<OfferStripDocument>("OfferStrip", offerStripSchema);