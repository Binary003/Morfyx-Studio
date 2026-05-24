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
  verifyRefreshToken
} from "../utils/token";
import { env } from "../config/env";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function normalizePhone(phone: string) {
  return phone.trim().replace(/[()\s-]/g, "");
}

function isValidPhone(phone: string) {
  return /^[0-9]{10}$/.test(phone);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Missing fields");

  const user = await registerUser(name, email, password, phone);
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  setAuthCookies(req, res, accessToken, refreshToken);

  sendSuccess(res, { user }, "Registered successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Missing fields");

  const { user, accessToken, refreshToken } = await authenticateUser(email, password);
  setAuthCookies(req, res, accessToken, refreshToken);

  sendSuccess(res, { user }, "Logged in");
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Missing fields");

  const { user, accessToken, refreshToken } = await authenticateUser(email, password);
  if (user.role !== "admin") throw new ApiError(403, "Admin access required");

  setAuthCookies(req, res, accessToken, refreshToken);
  sendSuccess(res, { user }, "Admin logged in");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw new ApiError(401, "Missing refresh token");

  const decoded = verifyRefreshToken(token) as { id: string; role: "admin" | "customer" };
  const accessToken = signAccessToken({ id: decoded.id, role: decoded.role });
  const refreshToken = signRefreshToken({ id: decoded.id, role: decoded.role });

  setAuthCookies(req, res, accessToken, refreshToken);
  sendSuccess(res, {}, "Token refreshed");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookies(req, res);
  sendSuccess(res, {}, "Logged out");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");

  const baseUrl = env.frontendUrls[0] || "";
  await createResetToken(email, baseUrl);
  sendSuccess(res, {}, "Reset email sent");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError(400, "Missing fields");

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() }
  }).select("+password +resetPasswordTokenHash +resetPasswordExpiresAt");

  if (!user) throw new ApiError(404, "User not found");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  sendSuccess(res, {}, "Password reset successful");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new ApiError(404, "User not found");

  sendSuccess(res, { user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const updates: { name?: string; phone?: string } = {};

  if (typeof req.body.name === "string") {
    const name = req.body.name.trim();
    if (!name) throw new ApiError(400, "Name is required");
    updates.name = name;
  }

  if (typeof req.body.phone === "string") {
    const phone = normalizePhone(req.body.phone);

    if (phone && !isValidPhone(phone)) {
      throw new ApiError(400, "Enter a valid 10-digit phone number");
    }

    updates.phone = phone;
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true
  }).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  sendSuccess(res, { user }, "Profile updated successfully");
});
