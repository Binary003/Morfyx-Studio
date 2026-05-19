import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { getAllCustomers, getCustomer } from "../controllers/customerController";

const router = Router();

// Admin only routes
router.get("/", requireAuth, requireRole("admin"), getAllCustomers);
router.get("/:id", requireAuth, requireRole("admin"), getCustomer);

export default router;
