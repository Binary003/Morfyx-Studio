import { Schema, model, Document, Types } from "mongoose";

export interface PaymentDocument extends Document {
  user: Types.ObjectId;
  order: Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  errorCode?: string;
  errorDescription?: string;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    errorCode: { type: String },
    errorDescription: { type: String }
  },
  { timestamps: true }
);

export const Payment = model<PaymentDocument>("Payment", paymentSchema);
