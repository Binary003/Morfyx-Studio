import { Schema, model, Document, Types } from "mongoose";

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ImportedDetails {
  sourceCountry?: string;
  customsPricing?: number;
  importBatch?: string;
  estimatedDelivery?: string;
  supplierInfo?: string;
}

export interface ProductDocument extends Document {
  name: string;
  slug: string;
  animeCategory: Types.ObjectId;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: ProductImage[];
  tags: string[];
  rating: number;
  reviews: Types.ObjectId[];
  offerStrip?: string;
  productType?: string;
  origin: "imported" | "local";
  model3DLink?: string;
  dimensions?: string;
  materials?: string;
  featured: boolean;
  trending: boolean;
  status: "active" | "inactive";
  importedDetails?: ImportedDetails;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    animeCategory: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
      }
    ],
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    offerStrip: { type: String },
    productType: { type: String },
    origin: { type: String, enum: ["imported", "local"], default: "local" },
    model3DLink: { type: String },
    dimensions: { type: String },
    materials: { type: String },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    importedDetails: {
      sourceCountry: { type: String },
      customsPricing: { type: Number },
      importBatch: { type: String },
      estimatedDelivery: { type: String },
      supplierInfo: { type: String }
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", tags: "text" });

export const Product = model<ProductDocument>("Product", productSchema);
