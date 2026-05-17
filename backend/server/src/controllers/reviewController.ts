import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { addReview, deleteReview, updateReview } from "../services/reviewService";

export const add = asyncHandler(async (req: Request, res: Response) => {
  const review = await addReview(
    req.user?.id as string,
    req.body.productId,
    Number(req.body.rating),
    req.body.comment
  );

  sendSuccess(res, { review }, "Review added");
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const review = await updateReview(
    req.params.id,
    req.user?.id as string,
    Number(req.body.rating),
    req.body.comment
  );

  sendSuccess(res, { review }, "Review updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteReview(req.params.id, req.user?.id as string);
  sendSuccess(res, {}, "Review deleted");
});
