import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// Required vars in production
const requiredVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_URL",
  ...(isProduction ? [
    "CLOUDINARY_NAME",
    "CLOUDINARY_KEY",
    "CLOUDINARY_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "EMAIL_USER",
    "EMAIL_PASS"
  ] : [])
];

const missingVars = requiredVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  throw new Error(`Missing required env vars: ${missingVars.join(", ")}`);
}

const frontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

if (frontendUrls.length === 0) {
  throw new Error("FRONTEND_URL must contain at least one valid URL");
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  cloudinaryName: process.env.CLOUDINARY_NAME as string,
  cloudinaryKey: process.env.CLOUDINARY_KEY as string,
  cloudinarySecret: process.env.CLOUDINARY_SECRET as string,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID as string,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET as string,
  // Shiprocket Configuration
  shiprocketEmail: process.env.SHIPROCKET_EMAIL as string,
  shiprocketPassword: process.env.SHIPROCKET_PASSWORD as string,
  shiprocketApiKey: process.env.SHIPROCKET_API_KEY as string,
  // Payment Configuration
  advancePaymentPercent: Number(process.env.ADVANCE_PAYMENT_PERCENT || 30),
  // Support Configuration
  whatsappNumber: process.env.WHATSAPP_SUPPORT_NUMBER || "+919876543210",
  // Existing configs
  shipmozoApiKey: process.env.SHIPMOZO_API_KEY as string,
  emailService: process.env.EMAIL_SERVICE || "gmail",
  emailApiKey: process.env.EMAIL_API_KEY,
  emailUser: process.env.EMAIL_USER as string,
  emailPass: process.env.EMAIL_PASS as string,
  emailFrom: process.env.EMAIL_FROM || "orders@morfyxstudio.com",
  adminEmail: process.env.ADMIN_EMAIL || "admin@morfyx.com",
  frontendUrls,
  cookieDomain: process.env.COOKIE_DOMAIN || ""
};
