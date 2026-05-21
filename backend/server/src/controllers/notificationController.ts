import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { listNotifications } from "../services/notificationService";

export const getAdminNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const notifications = await listNotifications({ adminOnly: true, limit: 100 });
  sendSuccess(res, { items: notifications });
});