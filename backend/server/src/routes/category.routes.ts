import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { upload } from "../utils/upload";
import { create, list, remove, update } from "../controllers/categoryController";

const router = Router();

router.get("/", list);
router.post("/", requireAuth, requireRole("admin"), upload.single("banner"), create);
router.put("/:id", requireAuth, requireRole("admin"), upload.single("banner"), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

export default router;
