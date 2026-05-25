import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { createOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder } from "../services/orderService";
import { createNotification } from "../services/notificationService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";
import { env } from "../config/env";
import { OrderDocument } from "../models/Order";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  const payload = {
    ...req.body,
    user: req.user?.id,
    customerEmail: (req.body.customerEmail || user?.email || "").toString().trim().toLowerCase()
  };
  const order = await createOrder(payload);

  await createNotification({
    userId: String(order.user),
    type: "order",
    title: "Order placed",
    message: `Order ${order.id} has been created`,
    data: { orderId: order.id }
  });

  const customerEmail = (payload.customerEmail || "").toString().trim().toLowerCase();
  if (customerEmail) {
    try {
      // Send detailed order notification email to user (fire-and-forget)
      sendEmail(
        customerEmail,
        "Order Received - Morfyx Studio",
        templates.customerOrderNotification(order as OrderDocument)
      )
        .then(info => console.log(`✉️ Order confirmation email queued to ${customerEmail} — messageId: ${info?.messageId}`))
        .catch(emailError => console.error(`❌ Failed to send order confirmation email to ${customerEmail}:`, emailError));
    } catch (emailError) {
      console.error(`❌ Failed to start send of order confirmation email to ${customerEmail}:`, emailError);
    }
  } else {
    console.warn(`⚠️ Order ${order.id} has no customer email, skipping customer confirmation email`);
  }

  if (user) {
    try {
      // Send notification email to admin
      await sendEmail(
        env.adminEmail,
        "New Order Received",
        templates.adminOrderNotification(order.id, user.name, order.totalAmount)
      );
      console.log(`✅ Admin order notification email sent to ${env.adminEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send admin order notification to ${env.adminEmail}:`, emailError);
    }
  }

  sendSuccess(res, { order }, "Order created");
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  const result = await getUserOrders(req.user?.id as string, req.query);
  sendSuccess(res, result);
});

export const allOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await getAllOrders();
  sendSuccess(res, { items: orders });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(
    req.params.id,
    req.body.status,
    req.body.trackingId,
    req.body.shipmentStatus,
    req.body.deliveryDays
  );
  sendSuccess(res, { order }, "Order updated");
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelOrder(req.params.id, req.user?.id as string);
  sendSuccess(res, { order }, "Order cancelled");
});
