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
