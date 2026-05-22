import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/apiError";

export const createOrder = async (payload: any) => {
  return Order.create(payload);
};

export const getUserOrders = async (userId: string) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return orders;
};

export const getAllOrders = async () => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  // Transform data for admin display
  return orders.map((order: any) => ({
    _id: order._id,
    customer: order.shippingInfo?.name || order.user?.name || "Unknown",
    customerEmail: order.customerEmail || order.user?.email || "N/A",
    orderStatus: order.orderStatus || "pending",
    paymentStatus: order.paymentInfo?.status || "pending",
    total: order.totalAmount,
    advanceAmount: order.advanceAmount,
    remainingCOD: order.remainingCOD,
    createdAt: order.createdAt,
    itemCount: order.orderedProducts?.length || 0,
    shipmentId: order.shipmentId,
    trackingId: order.trackingId,
    shipmentStatus: order.shipmentStatus,
    shippingInfo: {
      name: order.shippingInfo?.name,
      address: order.shippingInfo?.address,
      addressLine1: order.shippingInfo?.addressLine1,
      addressLine2: order.shippingInfo?.addressLine2,
      landmark: order.shippingInfo?.landmark,
      city: order.shippingInfo?.city,
      state: order.shippingInfo?.state,
      postalCode: order.shippingInfo?.postalCode,
      phone: order.shippingInfo?.phone
    }
  }));
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  trackingId?: string,
  shipmentStatus?: string
) => {
  const update: Record<string, string> = { orderStatus: status };

  if (trackingId !== undefined) {
    update.trackingId = trackingId;
  }

  if (shipmentStatus !== undefined) {
    update.shipmentStatus = shipmentStatus;
  }

  const order = await Order.findByIdAndUpdate(id, update, { new: true });
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

/**
 * Update product stock after successful payment
 * Decreases stock for each product in the order based on purchased quantity
 */
export const updateStockAfterPayment = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  // Decrease stock for each product in the order
  for (const orderedProduct of order.orderedProducts) {
    const product = await Product.findById(orderedProduct.product);
    if (!product) {
      console.warn(`Product ${orderedProduct.product} not found for order ${orderId}`);
      continue;
    }

    // Decrease stock by purchased quantity
    product.stock = Math.max(0, product.stock - orderedProduct.quantity);
    await product.save();

    console.log(
      `✅ Stock updated for ${product.name}: Decreased by ${orderedProduct.quantity}, New stock: ${product.stock}`
    );
  }

  return order;
};
