import { Inventory } from "../models/Inventory";
import { Product } from "../models/Product";
import { ApiError } from "../utils/apiError";
import { createNotification } from "./notificationService";

export const upsertInventory = async (productId: string, stock: number, userId?: string) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const updated = await Inventory.findOneAndUpdate(
    { product: productId },
    { stock, updatedBy: userId },
    { new: true, upsert: true }
  );

  product.stock = stock;
  await product.save();

  if (updated && updated.stock <= updated.lowStockThreshold) {
    await createNotification({
      type: "low_stock",
      title: "Low stock alert",
      message: `${product.name} is low on stock`
    });
  }

  return updated;
};

export const listInventory = async () => {
  return Inventory.find().populate("product", "name stock");
};
