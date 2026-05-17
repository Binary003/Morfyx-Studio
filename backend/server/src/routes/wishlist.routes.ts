import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { add, list, remove } from "../controllers/wishlistController";

const router = Router();

router.get("/", requireAuth, list);
router.post("/", requireAuth, add);
router.delete("/:productId", requireAuth, remove);

export default router;
