import { shipmozoClient } from "../config/shipmozo";
import { Order } from "../models/Order";
import { ApiError } from "../utils/apiError";

export const createShipment = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const payload = {
    orderId: order._id,
    amount: order.totalAmount,
    shippingInfo: order.shippingInfo,
    items: order.orderedProducts
  };

  const { data } = await shipmozoClient.post("/shipments", payload);
  return data;
};

export const trackShipment = async (trackingId: string) => {
  const { data } = await shipmozoClient.get(`/shipments/${trackingId}`);
  return data;
};
