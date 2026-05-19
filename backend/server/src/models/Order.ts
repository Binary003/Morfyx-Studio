import { Schema, model, Document, Types } from "mongoose";

export interface OrderedProduct {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  orderedProducts: OrderedProduct[];
  totalAmount: number;
  advanceAmount: number; // 30% payment via Razorpay
  remainingCOD: number; // 70% to be collected as COD
  paymentInfo: {
    provider: string;
    orderId?: string;
    paymentId?: string;
    signature?: string;
    status: "pending" | "paid" | "failed";
    advancePaid: boolean;
  };
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  shipmentStatus?: "not_created" | "pending" | "picked" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  shiprocketOrderId?: string;
  shipmentId?: string;
  cancellationReason?: string;
  cancellationDate?: Date;
  refundStatus?: "none" | "requested" | "approved" | "rejected";
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderedProducts: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }
      }
    ],
    totalAmount: { type: Number, required: true },
    advanceAmount: {
      type: Number,
      default: 0,
      description: "30% advance payment via Razorpay"
    },
    remainingCOD: {
      type: Number,
      default: 0,
      description: "70% COD amount"
    },
    paymentInfo: {
      provider: { type: String, default: "razorpay" },
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      advancePaid: { type: Boolean, default: false }
    },
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    orderStatus: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    shipmentStatus: {
      type: String,
      enum: ["not_created", "pending", "picked", "shipped", "delivered", "cancelled"],
      default: "not_created"
    },
    trackingId: { type: String },
    shiprocketOrderId: { type: String },
    shipmentId: { type: String },
    cancellationReason: { type: String },
    cancellationDate: { type: Date },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected"],
      default: "none"
    }
  },
  { timestamps: true }
);

export const Order = model<OrderDocument>("Order", orderSchema);
