import { Order } from "../models/Order";
import { ApiError } from "../utils/apiError";

export const createOrder = async (payload: any) => {
  return Order.create(payload);
};

export const getUserOrders = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  return Order.find().sort({ createdAt: -1 }).populate("user", "name email");
};

export const updateOrderStatus = async (id: string, status: string, trackingId?: string) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status, trackingId },
    { new: true }
  );
  if (!order) throw new ApiError(404, "Order not found");

  return order;
};

export const cancelOrder = async (id: string, userId: string) => {
  const order = await Order.findOne({ _id: id, user: userId });
  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = "cancelled";
  await order.save();

  return order;
};
