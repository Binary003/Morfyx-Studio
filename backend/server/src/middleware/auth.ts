import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/token";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const tokenFromHeader = header?.startsWith("Bearer ") ? header.split(" ")[1] : undefined;
  const token = tokenFromHeader || req.cookies?.access_token;

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const decoded = verifyAccessToken(token) as { id: string; role: string };
  req.user = { id: decoded.id, role: decoded.role };
  next();
};
