import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { addToWishlist, getWishlist, removeFromWishlist } from "../services/wishlistService";

export const add = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await addToWishlist(req.user?.id as string, req.body.productId);
  sendSuccess(res, { wishlist }, "Added to wishlist");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await removeFromWishlist(req.user?.id as string, req.params.productId);
  sendSuccess(res, { wishlist }, "Removed from wishlist");
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await getWishlist(req.user?.id as string);
  sendSuccess(res, { wishlist });
});
