import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { getOfferStrip, updateOfferStrip } from "../services/offerStripService";

const toPayload = (offerStrip: any) => ({
    key: offerStrip.key,
    items: offerStrip.items || [],
    isActive: offerStrip.isActive,
    updatedAt: offerStrip.updatedAt,
    createdAt: offerStrip.createdAt
});

export const getCurrent = asyncHandler(async (_req: Request, res: Response) => {
    const offerStrip = await getOfferStrip();
    sendSuccess(res, { offerStrip: toPayload(offerStrip) });
});

export const updateCurrent = asyncHandler(async (req: Request, res: Response) => {
    const offerStrip = await updateOfferStrip(req.body.items);
    sendSuccess(res, { offerStrip: toPayload(offerStrip) }, "Offer strip updated");
});