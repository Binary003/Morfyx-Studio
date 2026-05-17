import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import {
  getInventoryAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getRevenueAnalytics,
  getUserAnalytics
} from "../services/analyticsService";

export const revenue = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getRevenueAnalytics();
  sendSuccess(res, { data });
});

export const orders = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getOrderAnalytics();
  sendSuccess(res, { data });
});

export const products = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getProductAnalytics();
  sendSuccess(res, { data });
});

export const users = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getUserAnalytics();
  sendSuccess(res, { data });
});

export const inventory = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getInventoryAnalytics();
  sendSuccess(res, { data });
});
