import { Order } from "../models/Order";
import { ApiError } from "../utils/apiError";

export const createOrder = async (payload: any) => {
  return Order.create(payload);
};

export const getUserOrders = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  // Transform data for admin display
  return orders.map((order: any) => ({
    _id: order._id,
    customer: order.user?.name || "Unknown",
    customerEmail: order.user?.email,
    orderStatus: order.orderStatus || "pending",
    paymentStatus: order.paymentInfo?.status || "pending",
    total: order.totalAmount,
    advanceAmount: order.advanceAmount,
    remainingCOD: order.remainingCOD,
    createdAt: order.createdAt,
    itemCount: order.orderedProducts?.length || 0,
    trackingId: order.trackingId,
    shipmentStatus: order.shipmentStatus,
    shippingInfo: {
      name: order.shippingInfo?.name,
      address: order.shippingInfo?.address,
      city: order.shippingInfo?.city,
      state: order.shippingInfo?.state,
      postalCode: order.shippingInfo?.postalCode,
      phone: order.shippingInfo?.phone
    }
  }));
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
