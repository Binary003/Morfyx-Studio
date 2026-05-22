import { Schema, model, Document } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  featured?: boolean;
  bannerImage?: {
    url: string;
    publicId: string;
  };
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    bannerImage: {
      url: { type: String },
      publicId: { type: String }
    }
  },
  { timestamps: true }
);

export const Category = model<CategoryDocument>("Category", categorySchema);
