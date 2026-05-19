import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { User } from "../models/User";
import {
  authenticateUser,
  registerUser,
  createResetToken
} from "../services/authService";
import {
  clearAuthCookies,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken
} from "../utils/token";
import { env } from "../config/env";
import bcrypt from "bcryptjs";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Missing fields");

  const user = await registerUser(name, email, password, phone);
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(res, { user }, "Registered successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Missing fields");

  const { user, accessToken, refreshToken } = await authenticateUser(email, password);
  setAuthCookies(res, accessToken, refreshToken);

  sendSuccess(res, { user }, "Logged in");
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Missing fields");

  const { user, accessToken, refreshToken } = await authenticateUser(email, password);
  if (user.role !== "admin") throw new ApiError(403, "Admin access required");

  setAuthCookies(res, accessToken, refreshToken);
  // Return accessToken in response body so client can use it for Authorization header
  sendSuccess(res, { user, accessToken }, "Admin logged in");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw new ApiError(401, "Missing refresh token");

  const decoded = verifyRefreshToken(token) as { id: string; role: "admin" | "customer" };
  const accessToken = signAccessToken({ id: decoded.id, role: decoded.role });
  const refreshToken = signRefreshToken({ id: decoded.id, role: decoded.role });

  setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, {}, "Token refreshed");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  sendSuccess(res, {}, "Logged out");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");

  const resetToken = signAccessToken({ email });
  const baseUrl = env.frontendUrls[0] || "";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  await createResetToken(email, resetUrl);
  sendSuccess(res, {}, "Reset email sent");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, "Missing fields");

  const decoded = verifyAccessToken(token) as { email: string };
  const user = await User.findOne({ email: decoded.email }).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

  sendSuccess(res, {}, "Password reset successful");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new ApiError(404, "User not found");

  sendSuccess(res, { user });
});
