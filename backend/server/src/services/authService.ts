import { User } from "../models/User";
import { ApiError } from "../utils/apiError";
import { signAccessToken, signRefreshToken } from "../utils/token";
import { sendEmail, templates } from "./emailService";

export const registerUser = async (name: string, email: string, password: string, phone?: string) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already in use");

  const user = await User.create({ name, email, password, phone });
  await sendEmail(user.email, "Welcome to Morfyx Studio", templates.welcome(user.name));

  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });

  return { user, accessToken, refreshToken };
};

export const createResetToken = async (email: string, resetUrl: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  await sendEmail(user.email, "Reset your password", templates.passwordReset(resetUrl));
};
