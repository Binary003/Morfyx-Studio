import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { list, update } from "../controllers/inventoryController";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), list);
router.put("/:productId", requireAuth, requireRole("admin"), update);

export default router;
