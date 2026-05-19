import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { User } from "../models/User";

export const getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search = "" } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  // Build search filter
  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  // Get total count
  const total = await User.countDocuments({ role: "customer", ...searchFilter });

  // Get customers with pagination
  const customers = await User.find({ role: "customer", ...searchFilter })
    .select("_id name email phone orderHistory createdAt")
    .populate("orderHistory", "totalAmount orderStatus createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const items = customers.map((customer) => ({
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "N/A",
    orderHistory: customer.orderHistory || [],
    totalOrders: customer.orderHistory?.length || 0,
    totalSpent: (customer.orderHistory as any[])?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0,
    createdAt: customer.createdAt
  }));

  sendSuccess(
    res,
    {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    },
    "Customers fetched"
  );
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await User.findById(req.params.id)
    .select("-password")
    .populate("orderHistory")
    .populate("wishlist");

  if (!customer) {
    return sendSuccess(res, null, "Customer not found", 404);
  }

  sendSuccess(res, { customer });
});
