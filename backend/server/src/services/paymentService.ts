import crypto from "crypto";
import { razorpay } from "../config/razorpay";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { ApiError } from "../utils/apiError";

export const createRazorpayOrder = async (amount: number, currency = "INR") => {
  try {
    console.log("📋 Calling Razorpay SDK with amount:", amount, "currency:", currency);
    // Amount is already in paise from frontend, don't multiply again
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency
    });
    console.log("✅ Razorpay order created with ID:", order.id);
    return order;
  } catch (error: any) {
    console.error("❌ Razorpay SDK error:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error description:", error.description);
    throw error;
  }
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

export const fetchRazorpayPayment = async (paymentId: string) => {
  return razorpay.payments.fetch(paymentId);
};

export const recordPaymentSuccess = async (payload: any) => {
  const order = await Order.findById(payload.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.paymentInfo = {
    provider: "razorpay",
    orderId: payload.razorpayOrderId,
    paymentId: payload.razorpayPaymentId,
    signature: payload.razorpaySignature,
    status: "paid",
    advancePaid: true
  };
  order.orderStatus = "paid";
  await order.save();

  await Payment.create({
    user: order.user,
    order: order._id,
    amount: order.totalAmount,
    currency: "INR",
    status: "paid",
    razorpayOrderId: payload.razorpayOrderId,
    razorpayPaymentId: payload.razorpayPaymentId,
    razorpaySignature: payload.razorpaySignature
  });

  // Return the fully populated order
  const populatedOrder = await Order.findById(order._id);
  return populatedOrder;
};

export const recordPaymentFailure = async (payload: any) => {
  await Payment.create({
    user: payload.userId,
    order: payload.orderId,
    amount: payload.amount,
    currency: "INR",
    status: "failed",
    razorpayOrderId: payload.razorpayOrderId,
    errorCode: payload.errorCode,
    errorDescription: payload.errorDescription
  });
};
