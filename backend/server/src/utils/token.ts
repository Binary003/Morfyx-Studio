import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env";

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: "15m" });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret);

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = env.nodeEnv === "production";
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: env.cookieDomain || undefined
  } as const;

  res.cookie("access_token", accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { domain: env.cookieDomain || undefined });
  res.clearCookie("refresh_token", { domain: env.cookieDomain || undefined });
};
