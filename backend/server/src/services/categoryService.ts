import slugify from "slugify";
import { Category } from "../models/Category";
import { ApiError } from "../utils/apiError";

export const createCategory = async (payload: { name: string; description?: string; featured?: boolean }, bannerImage?: any) => {
  const slug = slugify(payload.name, { lower: true, strict: true });
  const exists = await Category.findOne({ slug });
  if (exists) throw new ApiError(409, "Category already exists");

  return Category.create({
    name: payload.name,
    slug,
    description: payload.description || "",
    featured: payload.featured || false,
    bannerImage,
  });
};

export const updateCategory = async (id: string, payload: any) => {
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  const updated = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) throw new ApiError(404, "Category not found");

  return updated;
};

export const deleteCategory = async (id: string) => {
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Category not found");

  return deleted;
};

export const listCategories = async () => {
  return Category.find().sort({ name: 1 });
};
