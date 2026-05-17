import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { allOrders, cancel, create, myOrders, updateStatus } from "../controllers/orderController";

const router = Router();

router.post("/", requireAuth, create);
router.get("/me", requireAuth, myOrders);
router.get("/", requireAuth, requireRole("admin"), allOrders);
router.put("/:id/status", requireAuth, requireRole("admin"), updateStatus);
router.put("/:id/cancel", requireAuth, cancel);

export default router;
