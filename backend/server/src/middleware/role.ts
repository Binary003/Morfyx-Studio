import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const requireRole = (role: "admin" | "customer") =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      throw new ApiError(403, "Forbidden");
    }
    next();
  };
