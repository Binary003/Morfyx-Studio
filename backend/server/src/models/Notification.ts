import { Schema, model, Document, Types } from "mongoose";

export interface NotificationDocument extends Document {
  user?: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Object },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = model<NotificationDocument>("Notification", notificationSchema);
