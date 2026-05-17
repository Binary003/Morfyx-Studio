import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { add, remove, update } from "../controllers/reviewController";

const router = Router();

router.post("/", requireAuth, add);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);

export default router;
