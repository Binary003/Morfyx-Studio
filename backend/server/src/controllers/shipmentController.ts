import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { createShipment, trackShipment } from "../services/shipmentService";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const shipment = await createShipment(req.params.orderId);
  sendSuccess(res, { shipment }, "Shipment created");
});

export const track = asyncHandler(async (req: Request, res: Response) => {
  const tracking = await trackShipment(req.params.trackingId);
  sendSuccess(res, { tracking });
});
