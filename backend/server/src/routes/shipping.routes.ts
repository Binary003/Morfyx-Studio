import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import {
    trackShipment,
    cancelShipment,
    getShipmentDetails,
    createShipment,
} from "../controllers/shippingController";

const router = Router();

/**
 * Public Routes
 */
router.get("/track/:shipmentId", trackShipment);

/**
 * User Routes
 */
router.post("/cancel/:shipmentId", requireAuth, cancelShipment);
router.get("/:shipmentId", requireAuth, getShipmentDetails);

/**
 * Admin Routes
 */
router.post("/create", requireAuth, requireRole("admin"), createShipment);

export default router;
