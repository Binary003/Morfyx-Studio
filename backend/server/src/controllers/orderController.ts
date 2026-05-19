import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { createOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder } from "../services/orderService";
import { createNotification } from "../services/notificationService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";
import { env } from "../config/env";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body, user: req.user?.id };
  const order = await createOrder(payload);

  await createNotification({
    userId: String(order.user),
    type: "order",
    title: "Order placed",
    message: `Order ${order.id} has been created`,
    data: { orderId: order.id }
  });

  const user = await User.findById(order.user);
  if (user) {
    try {
      // Send confirmation email to user
      await sendEmail(user.email, "Order confirmation", templates.orderConfirmation(order.id));
      console.log(`✅ Order confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send order confirmation email to ${user.email}:`, emailError);
    }

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
  const orders = await getUserOrders(req.user?.id as string);
  sendSuccess(res, { orders });
});

export const allOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await getAllOrders();
  sendSuccess(res, { items: orders });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(req.params.id, req.body.status, req.body.trackingId);
  sendSuccess(res, { order }, "Order updated");
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelOrder(req.params.id, req.user?.id as string);
  sendSuccess(res, { order }, "Order cancelled");
});
