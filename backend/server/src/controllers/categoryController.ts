import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../services/categoryService";
import { uploadToCloudinary } from "../utils/upload";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await listCategories();
  sendSuccess(res, { categories });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  let bannerImage;
  const file = (req.file as Express.Multer.File) || undefined;
  if (file) {
    bannerImage = await uploadToCloudinary(file.buffer, "categories");
  }

  const category = await createCategory(
    {
      name: req.body.name,
      description: req.body.description,
      featured: req.body.featured === true || req.body.featured === "true",
    },
    bannerImage
  );
  sendSuccess(res, { category }, "Category created");
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  let bannerImage;
  const file = (req.file as Express.Multer.File) || undefined;
  if (file) {
    bannerImage = await uploadToCloudinary(file.buffer, "categories");
  }

  const payload = { ...req.body, ...(bannerImage ? { bannerImage } : {}) };
  const category = await updateCategory(req.params.id, payload);
  sendSuccess(res, { category }, "Category updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const category = await deleteCategory(req.params.id);
  sendSuccess(res, { category }, "Category deleted");
});
