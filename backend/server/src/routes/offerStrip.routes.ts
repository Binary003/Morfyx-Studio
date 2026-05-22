import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { getCurrent, updateCurrent } from "../controllers/offerStripController";

const router = Router();

router.get("/", getCurrent);
router.put("/", requireAuth, requireRole("admin"), updateCurrent);

export default router;