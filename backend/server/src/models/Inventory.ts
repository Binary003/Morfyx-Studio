import { Schema, model, Document, Types } from "mongoose";

export interface InventoryDocument extends Document {
  product: Types.ObjectId;
  stock: number;
  lowStockThreshold: number;
  updatedBy?: Types.ObjectId;
}

const inventorySchema = new Schema<InventoryDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    stock: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 5 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Inventory = model<InventoryDocument>("Inventory", inventorySchema);
