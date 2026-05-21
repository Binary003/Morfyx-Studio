import { Notification } from "../models/Notification";

export const createNotification = async (payload: {
  userId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) => {
  await Notification.create({
    user: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    data: payload.data
  });
};

export const listNotifications = async (options?: { adminOnly?: boolean; limit?: number }) => {
  const query = options?.adminOnly ? { user: { $exists: false } } : {};
  return Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit ?? 50)
    .populate("user", "name email role");
};
