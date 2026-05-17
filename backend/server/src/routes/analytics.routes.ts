import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { inventory, orders, products, revenue, users } from "../controllers/analyticsController";

const router = Router();

router.get("/revenue", requireAuth, requireRole("admin"), revenue);
router.get("/orders", requireAuth, requireRole("admin"), orders);
router.get("/products", requireAuth, requireRole("admin"), products);
router.get("/users", requireAuth, requireRole("admin"), users);
router.get("/inventory", requireAuth, requireRole("admin"), inventory);

export default router;
