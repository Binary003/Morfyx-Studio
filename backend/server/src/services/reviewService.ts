import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { ApiError } from "../utils/apiError";

const recalcRating = async (productId: string) => {
  const reviews = await Review.find({ product: productId });
  const rating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await Product.findByIdAndUpdate(productId, { rating, reviews: reviews.map((r) => r._id) });
};

export const addReview = async (userId: string, productId: string, rating: number, comment?: string) => {
  const review = await Review.create({ user: userId, product: productId, rating, comment });
  await recalcRating(productId);
  return review;
};

export const updateReview = async (id: string, userId: string, rating: number, comment?: string) => {
  const review = await Review.findOne({ _id: id, user: userId });
  if (!review) throw new ApiError(404, "Review not found");

  review.rating = rating;
  review.comment = comment;
  await review.save();

  await recalcRating(String(review.product));
  return review;
};

export const deleteReview = async (id: string, userId: string) => {
  const review = await Review.findOneAndDelete({ _id: id, user: userId });
  if (!review) throw new ApiError(404, "Review not found");

  await recalcRating(String(review.product));
};
