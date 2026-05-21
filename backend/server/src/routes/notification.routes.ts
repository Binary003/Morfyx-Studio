import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { getAdminNotifications } from "../controllers/notificationController";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), getAdminNotifications);

export default router;