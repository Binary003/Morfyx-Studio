import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { User } from "../models/User";
import { Order } from "../models/Order";

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

    const customerIds = customers.map((customer) => customer._id);
    const customerEmails = customers.map((customer) => customer.email.trim().toLowerCase());
    const customerMap = new Map<string, { totalOrders: number; totalSpent: number; orderIds: Set<string> }>();
    const emailToCustomerId = new Map<string, string>();

    customers.forEach((customer) => {
        const customerId = String(customer._id);
        customerMap.set(customerId, { totalOrders: 0, totalSpent: 0, orderIds: new Set<string>() });
        emailToCustomerId.set(customer.email.trim().toLowerCase(), customerId);
    });

    const matchingOrders = customerIds.length > 0
        ? await Order.find({
            $or: [
                { user: { $in: customerIds } },
                { customerEmail: { $in: customerEmails } }
            ]
        })
            .select("_id user customerEmail totalAmount")
            .lean()
        : [];

    for (const order of matchingOrders) {
        const orderId = String(order._id);
        const userId = order.user ? String(order.user) : "";
        const emailKey = (order.customerEmail || "").trim().toLowerCase();
        const matchedCustomerId = customerMap.has(userId) ? userId : (emailToCustomerId.get(emailKey) || "");

        if (!matchedCustomerId) {
            continue;
        }

        const bucket = customerMap.get(matchedCustomerId);
        if (!bucket || bucket.orderIds.has(orderId)) {
            continue;
        }

        bucket.orderIds.add(orderId);
        bucket.totalOrders += 1;
        bucket.totalSpent += Number(order.totalAmount || 0);
    }

    const items = customers.map((customer) => ({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "N/A",
        orderHistory: customer.orderHistory || [],
        totalOrders: customerMap.get(String(customer._id))?.totalOrders || 0,
        totalSpent: customerMap.get(String(customer._id))?.totalSpent || 0,
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
        res.status(404).json({
            success: false,
            message: "Customer not found"
        });
        return;
    }

    sendSuccess(res, { customer });
});
