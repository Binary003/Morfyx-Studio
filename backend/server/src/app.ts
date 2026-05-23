import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { apiLimiter } from "./middleware/rateLimit";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import customerRoutes from "./routes/customer.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import analyticsRoutes from "./routes/analytics.routes";
import inventoryRoutes from "./routes/inventory.routes";
import notificationRoutes from "./routes/notification.routes";
import offerStripRoutes from "./routes/offerStrip.routes";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.nodeEnv === "production",
  hsts: env.nodeEnv === "production"
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Conditional logging based on environment
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(apiLimiter);

app.use(
  cors({
    origin: env.frontendUrls,
    credentials: true
  })
);

const allowedOrigins = new Set(env.frontendUrls);
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      return res.status(403).json({ success: false, message: "Invalid request origin" });
    }
  }
  next();
});

app.get("/", (_req, res) => {
  res.json({ success: true, message: "API healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/offers", offerStripRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
