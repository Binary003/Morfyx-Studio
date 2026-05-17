import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Internal server error";

  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, err);

  res.status(status).json({
    success: false,
    message: isDevelopment ? message : "An error occurred",
    ...(isDevelopment && { stack: err.stack })
  });
};
