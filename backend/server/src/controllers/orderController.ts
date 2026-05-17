import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { createOrder, getAllOrders, getUserOrders, updateOrderStatus, cancelOrder } from "../services/orderService";
import { createNotification } from "../services/notificationService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";

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
    await sendEmail(user.email, "Order confirmation", templates.orderConfirmation(order.id));
  }
  sendSuccess(res, { order }, "Order created");
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await getUserOrders(req.user?.id as string);
  sendSuccess(res, { orders });
});

export const allOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await getAllOrders();
  sendSuccess(res, { orders });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderStatus(req.params.id, req.body.status, req.body.trackingId);
  sendSuccess(res, { order }, "Order updated");
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelOrder(req.params.id, req.user?.id as string);
  sendSuccess(res, { order }, "Order cancelled");
});
