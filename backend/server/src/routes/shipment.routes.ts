import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { create, track } from "../controllers/shipmentController";

const router = Router();

router.post("/:orderId", requireAuth, requireRole("admin"), create);
router.get("/track/:trackingId", requireAuth, track);

export default router;
