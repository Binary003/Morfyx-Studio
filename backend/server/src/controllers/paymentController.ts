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
  const { orderId } = req.body;
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

  const advanceAmount = Math.round(order.totalAmount * (env.advancePaymentPercent / 100));
  if (advanceAmount <= 0) {
    throw new ApiError(400, "Invalid order amount");
  }

  const razorpayOrder = await createRazorpayOrder(advanceAmount * 100);

  order.advanceAmount = advanceAmount;
  order.remainingCOD = Math.max(0, order.totalAmount - advanceAmount);
  order.paymentInfo = {
    provider: "razorpay",
    orderId: razorpayOrder.id,
    status: "pending",
    advancePaid: false
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
  const expectedAdvanceAmount = Math.round(order.totalAmount * (env.advancePaymentPercent / 100));
  const expectedAmountPaise = expectedAdvanceAmount * 100;

  if (
    payment.order_id !== razorpayOrderId ||
    payment.amount !== expectedAmountPaise ||
    payment.currency !== "INR" ||
    (payment.status !== "captured" && payment.status !== "authorized")
  ) {
    throw new ApiError(400, "Payment details mismatch");
  }

  const advanceAmount = expectedAdvanceAmount;
  const remainingCOD = Math.max(0, order.totalAmount - advanceAmount);

  order.advanceAmount = advanceAmount;
  order.remainingCOD = remainingCOD;
  order.paymentInfo = {
    provider: "razorpay",
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    status: "paid",
    advancePaid: true,
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
    await createNotification({
      userId: notificationUserId,
      type: "order",
      title: "Payment verified and order placed",
      message: `Hi ${customerName}, we verified your payment of ₹${advanceAmount}. Your order is now confirmed and the remaining ₹${remainingCOD} will be collected on delivery.`,
      data: {
        orderId: order._id,
        paymentStatus: "paid",
        orderStatus: "processing",
        advanceAmount,
        remainingCOD
      },
    });
  } catch (notificationError) {
    console.error("Failed to create payment notification:", notificationError);
  }

  try {
    await createNotification({
      type: "order",
      title: "Order placed and payment verified",
      message: `Order ${order._id} is paid and ready for manual shipment processing.`,
      data: {
        orderId: order._id,
        paymentStatus: "paid",
        orderStatus: "processing",
        advanceAmount,
        remainingCOD,
        audience: "admin"
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

  if (userEmail) {
    try {
      // Send payment confirmation to user asynchronously so verification API isn't delayed
      sendEmail(
        userEmail,
        "Payment Received - Shipment Processing",
        templates.paymentConfirmation(order as OrderDocument)
      )
        .then(info => console.log(`Payment confirmation email queued to ${userEmail} - messageId: ${info?.messageId}`))
        .catch(emailError => console.error("Failed to send payment email:", emailError));
    } catch (emailError) {
      console.error("Failed to start payment email send:", emailError);
    }
  }

  try {
    await sendEmail(
      env.adminEmail,
      "New Order Received - Manual Shipment Required",
      templates.adminPaymentNotification(order as OrderDocument)
    );
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
