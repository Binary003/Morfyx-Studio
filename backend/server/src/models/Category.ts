import { Schema, model, Document } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  bannerImage?: {
    url: string;
    publicId: string;
  };
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    bannerImage: {
      url: { type: String },
      publicId: { type: String }
    }
  },
  { timestamps: true }
);

export const Category = model<CategoryDocument>("Category", categorySchema);
