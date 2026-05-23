import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/apiError";
import { parsePagination } from "../utils/pagination";

export const createOrder = async (payload: any) => {
  const orderedProducts = Array.isArray(payload.orderedProducts) ? payload.orderedProducts : [];
  if (!payload.user || orderedProducts.length === 0) {
    throw new ApiError(400, "Order items are required");
  }

  type NormalizedOrderItem = {
    product: unknown;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  };

  const productIds = orderedProducts.map((item: any) => String(item.product));
  const uniqueProductIds = Array.from(new Set(productIds));
  const products = await Product.find({ _id: { $in: uniqueProductIds }, status: "active" });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const normalizedItems: NormalizedOrderItem[] = orderedProducts.map((item: any) => {
    const productId = String(item.product);
    const product = productMap.get(productId);
    const quantity = Number(item.quantity);

    if (!product) {
      throw new ApiError(404, `Product not found: ${productId}`);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, `Invalid quantity for product: ${product.name}`);
    }

    if (product.stock < quantity) {
      throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
    }

    const unitPrice = Number(product.discountPrice ?? product.price);
    return {
      product: product._id,
      name: product.name,
      price: unitPrice,
      quantity,
      image: product.images?.[0]?.url
    };
  });

  const totalAmount = Number(
    normalizedItems
      .reduce((sum: number, item: NormalizedOrderItem) => sum + item.price * item.quantity, 0)
      .toFixed(2)
  );

  return Order.create({
    user: payload.user,
    customerEmail: (payload.customerEmail || "").toString().trim().toLowerCase(),
    orderedProducts: normalizedItems,
    totalAmount,
    shippingInfo: payload.shippingInfo,
    paymentInfo: {
      provider: "razorpay",
      status: "pending",
      advancePaid: false
    },
    orderStatus: "pending",
    shipmentStatus: "not_created"
  });
};

export const getUserOrders = async (userId: string, query: any = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };

  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  ]);

  return {
    items: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
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
  status?: string,
  trackingId?: string,
  shipmentStatus?: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  const hasShipmentUpdate = trackingId !== undefined || shipmentStatus !== undefined;
  const movingToShipmentState = status === "processing" || status === "shipped" || status === "delivered";
  const isPaymentVerified = order.paymentInfo?.status === "paid";

  if ((hasShipmentUpdate || movingToShipmentState) && !isPaymentVerified) {
    throw new ApiError(400, "Payment must be verified before shipment updates");
  }

  const update: Record<string, string> = {};

  if (status !== undefined) {
    update.orderStatus = status;
  }

  if (trackingId !== undefined) {
    update.trackingId = trackingId;
  }

  if (shipmentStatus !== undefined) {
    update.shipmentStatus = shipmentStatus;
  }

  if (Object.keys(update).length === 0) {
    return order;
  }

  const updatedOrder = await Order.findByIdAndUpdate(id, update, { new: true });
  if (!updatedOrder) throw new ApiError(404, "Order not found");

  return updatedOrder;
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
