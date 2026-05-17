import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { createRazorpayOrder, recordPaymentFailure, recordPaymentSuccess, verifyRazorpaySignature } from "../services/paymentService";
import { createShipment } from "../services/shipmentService";
import { createNotification } from "../services/notificationService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body;
  if (!amount) throw new ApiError(400, "Amount required");

  const order = await createRazorpayOrder(Number(amount));
  sendSuccess(res, { order });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    env.razorpayKeySecret
  );

  if (!isValid) throw new ApiError(400, "Invalid payment signature");

  const order = await recordPaymentSuccess({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  await createNotification({
    userId: String(order.user),
    type: "payment",
    title: "Payment successful",
    message: `Payment received for order ${order.id}`,
    data: { orderId: order.id }
  });

  const user = await User.findById(order.user);
  if (user) {
    await sendEmail(user.email, "Payment confirmation", templates.paymentConfirmation(order.id));
  }

  const shipment = await createShipment(order.id);
  if (shipment?.trackingId) {
    order.trackingId = shipment.trackingId;
    order.orderStatus = "processing";
    await order.save();

    await createNotification({
      userId: String(order.user),
      type: "shipment",
      title: "Shipment created",
      message: `Tracking ID: ${shipment.trackingId}`,
      data: { trackingId: shipment.trackingId }
    });

    if (user && shipment.trackingId) {
      await sendEmail(
        user.email,
        "Shipment tracking",
        templates.shipmentTracking(shipment.trackingId)
      );
    }
  }

  sendSuccess(res, { order, shipment }, "Payment verified");
});

export const paymentFailed = asyncHandler(async (req: Request, res: Response) => {
  await recordPaymentFailure(req.body);
  sendSuccess(res, {}, "Payment failure recorded");
});
