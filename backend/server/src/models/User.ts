import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface Address {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  addresses: Address[];
  wishlist: Types.ObjectId[];
  orderHistory: Types.ObjectId[];
  role: "customer" | "admin";
  comparePassword: (candidate: string) => Promise<boolean>;
}

const addressSchema = new Schema<Address>(
  {
    label: { type: String },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    role: { type: String, enum: ["customer", "admin"], default: "customer" }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<UserDocument>("User", userSchema);
