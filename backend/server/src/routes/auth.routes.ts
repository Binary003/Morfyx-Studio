import { Router } from "express";
import {
  adminLogin,
  forgotPassword,
  login,
  logout,
  me,
  updateMe,
  refresh,
  register,
  resetPassword
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/admin/login", authLimiter, adminLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, updateMe);

export default router;
