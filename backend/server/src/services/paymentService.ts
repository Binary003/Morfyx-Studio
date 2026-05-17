import crypto from "crypto";
import { razorpay } from "../config/razorpay";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { ApiError } from "../utils/apiError";

export const createRazorpayOrder = async (amount: number, currency = "INR") => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency
  });

  return order;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
};

export const recordPaymentSuccess = async (payload: any) => {
  const order = await Order.findById(payload.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.paymentInfo = {
    provider: "razorpay",
    orderId: payload.razorpayOrderId,
    paymentId: payload.razorpayPaymentId,
    signature: payload.razorpaySignature,
    status: "paid"
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

  return order;
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
