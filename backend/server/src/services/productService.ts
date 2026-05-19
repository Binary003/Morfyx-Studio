import slugify from "slugify";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { ApiError } from "../utils/apiError";
import { parsePagination } from "../utils/pagination";

export const createProduct = async (payload: any) => {
  const slug = slugify(payload.name, { lower: true, strict: true });
  const existing = await Product.findOne({ slug });
  if (existing) throw new ApiError(409, "Product already exists");

  return Product.create({ ...payload, slug });
};

export const updateProduct = async (id: string, payload: any) => {
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  }

  const updated = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) throw new ApiError(404, "Product not found");

  return updated;
};

export const deleteProduct = async (id: string) => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Product not found");

  return deleted;
};

export const getProduct = async (idOrSlug: string) => {
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const product = await Product.findOne(query).populate("animeCategory").populate("reviews");
  if (!product) throw new ApiError(404, "Product not found");

  return product;
};

export const listProducts = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const filter: any = {};

  // Handle category filter by name
  if (query.category) {
    const category = await Category.findOne({
      $or: [
        { name: { $regex: query.category, $options: "i" } },
        { slug: query.category }
      ]
    });
    if (category) {
      filter.animeCategory = category._id;
    }
  }

  if (query.featured) filter.featured = query.featured === "true";
  if (query.trending) filter.trending = query.trending === "true";
  if (query.status) filter.status = query.status;
  if (query.origin) filter.origin = query.origin;

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("animeCategory")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Product.countDocuments(filter)
  ]);

  return { items, total, page, limit };
};

export const searchProducts = async (query: string) => {
  return Product.find({ $text: { $search: query } }).limit(20);
};
