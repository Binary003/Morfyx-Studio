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

const healthPayload = { success: true, message: "API healthy" };

app.get("/", (_req, res) => {
  res.json(healthPayload);
});

app.get("/health", (_req, res) => {
  res.json(healthPayload);
});

app.get("/api", (_req, res) => {
  res.json(healthPayload);
});

app.get("/api/health", (_req, res) => {
  res.json(healthPayload);
});

const routePrefixes = ["/api", ""] as const;

for (const prefix of routePrefixes) {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/customers`, customerRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/analytics`, analyticsRoutes);
  app.use(`${prefix}/inventory`, inventoryRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/offers`, offerStripRoutes);
}

app.use(notFound);
app.use(errorHandler);

export default app;
