import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { upload } from "../utils/upload";
import { create, getOne, list, remove, search, update } from "../controllers/productController";

const router = Router();

// Public endpoints
router.get("/", list);
router.get("/search", search);
router.get("/:id", getOne);

// Protected admin endpoints
router.post("/", requireAuth, requireRole("admin"), upload.array("images", 3), create);
router.put("/:id", requireAuth, requireRole("admin"), upload.array("images", 3), update);
router.delete("/:id", requireAuth, requireRole("admin"), remove);

export default router;
