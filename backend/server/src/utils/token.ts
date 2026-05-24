import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { env } from "../config/env";

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret);

function resolveCookieDomain(req: Request): string | undefined {
  const configuredDomain = env.cookieDomain?.trim();
  if (!configuredDomain) return undefined;

  const hostname = req.hostname?.toLowerCase();
  if (!hostname) return undefined;

  const normalizedDomain = configuredDomain
    .toLowerCase()
    .replace(/^\./, "");

  if (hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`)) {
    return normalizedDomain;
  }

  // If configured domain doesn't match current host (e.g. railway.app),
  // fallback to host-only cookies so auth still works.
  return undefined;
}

export const setAuthCookies = (req: Request, res: Response, accessToken: string, refreshToken: string) => {
  const isProd = env.nodeEnv === "production";
  const cookieDomain = resolveCookieDomain(req);
  const baseOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: cookieDomain
  } as const;

  res.cookie("access_token", accessToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days to match token expiry
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookies = (req: Request, res: Response) => {
  const cookieDomain = resolveCookieDomain(req);
  res.clearCookie("access_token", { domain: cookieDomain });
  res.clearCookie("refresh_token", { domain: cookieDomain });
};
