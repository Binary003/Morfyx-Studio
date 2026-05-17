import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { ApiError } from "../utils/apiError";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  searchProducts,
  updateProduct
} from "../services/productService";
import { uploadToCloudinary } from "../utils/upload";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const images = [] as { url: string; publicId: string }[];

  for (const file of files) {
    const uploaded = await uploadToCloudinary(file.buffer, "products");
    images.push(uploaded);
  }

  const payload = { ...req.body, images };
  const product = await createProduct(payload);
  sendSuccess(res, { product }, "Product created");
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length) {
    const images = [] as { url: string; publicId: string }[];
    for (const file of files) {
      const uploaded = await uploadToCloudinary(file.buffer, "products");
      images.push(uploaded);
    }
    req.body.images = images;
  }

  const product = await updateProduct(req.params.id, req.body);
  sendSuccess(res, { product }, "Product updated");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const product = await deleteProduct(req.params.id);
  sendSuccess(res, { product }, "Product deleted");
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProduct(req.params.id);
  sendSuccess(res, { product });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listProducts(req.query);
  sendSuccess(res, result);
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q || "").trim();
  if (!q) throw new ApiError(400, "Query missing");

  const items = await searchProducts(q);
  sendSuccess(res, { items });
});
