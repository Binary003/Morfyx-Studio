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
  customerEmail?: string;
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
    paymentFor?: "advance" | "full";
  };
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderStatus: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  shipmentStatus?: "not_created" | "pending" | "picked" | "shipped" | "delivered" | "cancelled";
  deliveryDays?: number;
  trackingId?: string;
  shiprocketOrderId?: string;
  shipmentId?: string;
  cancellationReason?: string;
  cancellationDate?: Date;
  refundStatus?: "none" | "requested" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerEmail: { type: String, lowercase: true, trim: true },
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
      advancePaid: { type: Boolean, default: false },
      paymentFor: { type: String, enum: ["advance", "full"], default: "advance" }
    },
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true, match: /^\+?[0-9]{10,15}$/ },
      address: { type: String, required: true },
      addressLine1: { type: String },
      addressLine2: { type: String },
      landmark: { type: String },
      city: { type: String, required: true, match: /^[A-Za-z\s.-]{2,50}$/ },
      state: { type: String, required: true, match: /^[A-Za-z\s.-]{2,50}$/ },
      postalCode: { type: String, required: true, match: /^[A-Za-z0-9\s-]{4,10}$/ },
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
    deliveryDays: { type: Number },
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
