import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { createRazorpayOrder, fetchRazorpayPayment, recordPaymentFailure, verifyRazorpaySignature } from "../services/paymentService";
import { createNotification } from "../services/notificationService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";
import { Order, OrderDocument } from "../models/Order";
import { updateStockAfterPayment } from "../services/orderService";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, paymentType, amount } = req.body; // paymentType: 'advance' | 'full', amount: optional paise from client
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!orderId) {
    throw new ApiError(400, "Order ID required");
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentInfo?.status === "paid") {
    throw new ApiError(409, "Order is already paid");
  }

  // Determine whether this order is for advance (default) or full payment
  const isFull = paymentType === "full";

  // If frontend provided an explicit amount (in paise), trust that; otherwise calculate server-side
  let amountPaise: number;
  if (typeof amount === "number" && amount > 0) {
    amountPaise = Math.round(amount);
  } else {
    amountPaise = isFull
      ? Math.round(order.totalAmount * 100)
      : Math.round(order.totalAmount * env.advancePaymentPercent);
  }

  if (amountPaise <= 0) {
    throw new ApiError(400, "Invalid order amount");
  }

  // createRazorpayOrder expects amount in paise
  const razorpayOrder = await createRazorpayOrder(amountPaise);

  const advanceAmount = Math.round((amountPaise / 100) * 100) / 100;
  order.advanceAmount = advanceAmount;
  order.remainingCOD = Math.max(0, Math.round((order.totalAmount - advanceAmount) * 100) / 100);
  order.paymentInfo = {
    provider: "razorpay",
    orderId: razorpayOrder.id,
    status: "pending",
    advancePaid: false,
    paymentFor: isFull ? "full" : "advance",
  };
  await order.save();

  sendSuccess(res, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  const order = await Order.findOne({ _id: orderId, user: userId }).populate("user");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentInfo?.status === "paid") {
    throw new ApiError(409, "Order is already paid");
  }

  if (!order.paymentInfo?.orderId || order.paymentInfo.orderId !== razorpayOrderId) {
    throw new ApiError(400, "Invalid payment order reference");
  }

  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    env.razorpayKeySecret
  );

  if (!isValid) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const payment = await fetchRazorpayPayment(razorpayPaymentId);

  // Determine expected amount based on whether this order was created for full or advance
  const paymentFor = (order.paymentInfo as any)?.paymentFor || "advance";
  const expectedAmountPaise = paymentFor === "full"
    ? Math.round(order.totalAmount * 100)
    : Math.round(order.totalAmount * env.advancePaymentPercent);

  if (
    payment.order_id !== razorpayOrderId ||
    payment.amount !== expectedAmountPaise ||
    payment.currency !== "INR" ||
    (payment.status !== "captured" && payment.status !== "authorized")
  ) {
    throw new ApiError(400, "Payment details mismatch");
  }

  const advanceAmount = Math.round((expectedAmountPaise / 100) * 100) / 100;
  const remainingCOD = Math.max(0, Math.round((order.totalAmount - advanceAmount) * 100) / 100);

  order.advanceAmount = advanceAmount;
  order.remainingCOD = remainingCOD;
  order.paymentInfo = {
    provider: "razorpay",
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    status: "paid",
    advancePaid: true,
    paymentFor: paymentFor,
  };
  order.orderStatus = "processing";
  order.shipmentStatus = "not_created";
  await order.save();

  // Update product stock after successful payment
  try {
    await updateStockAfterPayment(orderId);
  } catch (stockError: any) {
    // Don't throw - stock update should not block payment verification.
    console.error("Stock update failed:", stockError.message);
  }

  const user = (order.user as any);
  const notificationUserId = user?._id ? String(user._id) : String(order.user);
  const customerName = user?.name || order.shippingInfo.name;

  // Create notification as a best-effort side effect so payment verification
  // can still complete even if notification persistence fails.
  try {
    const isFull = (order.paymentInfo as any)?.paymentFor === "full";
    const userMessage = isFull
      ? `Hi ${customerName}, we verified your full payment of ₹${advanceAmount}. Your order is now confirmed.`
      : `Hi ${customerName}, we verified your payment of ₹${advanceAmount}. Your order is now confirmed and the remaining ₹${remainingCOD} will be collected on delivery.`;

    await createNotification({
      userId: notificationUserId,
      type: "order",
      title: isFull ? "Full payment received" : "Payment verified and order placed",
      message: userMessage,
      data: {
        orderId: order._id,
        paymentStatus: "paid",
        orderStatus: "processing",
        advanceAmount,
        remainingCOD,
        paymentFor: (order.paymentInfo as any)?.paymentFor || "advance",
      },
    });
  } catch (notificationError) {
    console.error("Failed to create payment notification:", notificationError);
  }

  try {
    const isFull = (order.paymentInfo as any)?.paymentFor === "full";
    await createNotification({
      type: "order",
      title: isFull ? "Order paid in full" : "Order placed and payment verified",
      message: `Order ${order._id} is paid and ready for manual shipment processing.`,
      data: {
        orderId: order._id,
        paymentStatus: "paid",
        orderStatus: "processing",
        advanceAmount,
        remainingCOD,
        audience: "admin",
        paymentFor: (order.paymentInfo as any)?.paymentFor || "advance",
      }
    });
  } catch (notificationError) {
    console.error("Failed to create admin payment notification:", notificationError);
  }

  // Send payment confirmation email
  let userEmail = (order.customerEmail || user?.email) as string | undefined;
  if (!userEmail) {
    const fallbackUser = await User.findById(order.user).select("email");
    userEmail = fallbackUser?.email;
  }

  const isFull = (order.paymentInfo as any)?.paymentFor === "full";

  if (userEmail) {
    try {
      // Send payment confirmation to user asynchronously so verification API isn't delayed
      const subject = isFull ? "Full Payment Received - Shipment Processing" : "Payment Received - Shipment Processing";
      const template = isFull ? templates.paymentConfirmationFull(order as OrderDocument) : templates.paymentConfirmation(order as OrderDocument);

      sendEmail(userEmail, subject, template)
        .then(info => console.log(`Payment confirmation email queued to ${userEmail} - messageId: ${info?.messageId}`))
        .catch(emailError => console.error("Failed to send payment email:", emailError));
    } catch (emailError) {
      console.error("Failed to start payment email send:", emailError);
    }
  }

  try {
    const adminTemplate = isFull ? templates.adminPaymentNotificationFull(order as OrderDocument) : templates.adminPaymentNotification(order as OrderDocument);
    await sendEmail(env.adminEmail, "New Order Received - Manual Shipment Required", adminTemplate);
    console.log("Admin notification sent");
  } catch (emailError) {
    console.error("Failed to send admin email:", emailError);
  }

  sendSuccess(res, { order }, "Payment verified and order placed. Shipment will be handled manually.");
});

export const paymentFailed = asyncHandler(async (req: Request, res: Response) => {
  await recordPaymentFailure(req.body);
  sendSuccess(res, {}, "Payment failure recorded");
});
