import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { listInventory, upsertInventory } from "../services/inventoryService";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await listInventory();
  sendSuccess(res, { items });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const item = await upsertInventory(req.params.productId, Number(req.body.stock), req.user?.id);
  sendSuccess(res, { item }, "Inventory updated");
});
