import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createOrder, paymentFailed, verifyPayment } from "../controllers/paymentController";
import { paymentLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/razorpay/order", requireAuth, paymentLimiter, createOrder);
router.post("/razorpay/verify", requireAuth, paymentLimiter, verifyPayment);
router.post("/razorpay/failure", requireAuth, paymentLimiter, paymentFailed);

export default router;
