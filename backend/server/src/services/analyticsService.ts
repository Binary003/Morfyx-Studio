import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Inventory } from "../models/Inventory";

export const getRevenueAnalytics = async () => {
  const result = await Order.aggregate([
    { $match: { orderStatus: { $in: ["paid", "processing", "shipped", "delivered"] } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]);

  return result[0] || { total: 0, count: 0 };
};

export const getOrderAnalytics = async () => {
  const totalOrders = await Order.countDocuments();
  const pending = await Order.countDocuments({ orderStatus: "pending" });
  const shipped = await Order.countDocuments({ orderStatus: "shipped" });

  return { totalOrders, pending, shipped };
};

export const getProductAnalytics = async () => {
  const totalProducts = await Product.countDocuments();
  const featured = await Product.countDocuments({ featured: true });
  const trending = await Product.countDocuments({ trending: true });

  return { totalProducts, featured, trending };
};

export const getUserAnalytics = async () => {
  const totalUsers = await User.countDocuments({ role: "customer" });
  const totalAdmins = await User.countDocuments({ role: "admin" });

  return { totalUsers, totalAdmins };
};

export const getInventoryAnalytics = async () => {
  const lowStock = await Inventory.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } })
    .populate("product", "name")
    .limit(20);

  return { lowStockCount: lowStock.length, lowStock };
};
