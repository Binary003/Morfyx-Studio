import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createOrder, paymentFailed, verifyPayment } from "../controllers/paymentController";

const router = Router();

router.post("/razorpay/order", requireAuth, createOrder);
router.post("/razorpay/verify", requireAuth, verifyPayment);
router.post("/razorpay/failure", requireAuth, paymentFailed);

export default router;
