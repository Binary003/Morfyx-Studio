import { User } from "../models/User";
import { ApiError } from "../utils/apiError";

export const addToWishlist = async (userId: string, productId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.wishlist.includes(productId as any)) {
    user.wishlist.push(productId as any);
    await user.save();
  }

  return user.wishlist;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
  await user.save();

  return user.wishlist;
};

export const getWishlist = async (userId: string) => {
  const user = await User.findById(userId).populate("wishlist");
  if (!user) throw new ApiError(404, "User not found");

  return user.wishlist;
};
