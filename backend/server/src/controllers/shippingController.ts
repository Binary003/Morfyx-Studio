import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { Order } from "../models/Order";
import { shiprocketService } from "../services/shiprocketService";
import { env } from "../config/env";

/**
 * Track shipment
 * GET /api/shipping/track/:shipmentId
 */
export const trackShipment = asyncHandler(async (req: Request, res: Response) => {
    const { shipmentId } = req.params;

    if (!shipmentId) {
        throw new ApiError(400, "Shipment ID is required");
    }

    const tracking = await shiprocketService.trackShipment(shipmentId);
    sendSuccess(res, { tracking }, "Shipment tracking retrieved");
});

/**
 * Cancel shipment
 * POST /api/shipping/cancel/:shipmentId
 * Only allowed if shipment hasn't been picked up
 */
export const cancelShipment = asyncHandler(async (req: Request, res: Response) => {
    const { shipmentId } = req.params;
    const userId = req.user?.id;

    if (!shipmentId) {
        throw new ApiError(400, "Shipment ID is required");
    }

    // Find order by shipment ID and verify user ownership
    const order = await Order.findOne({ shipmentId });

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Verify user is the order owner
    if (order.user.toString() !== userId) {
        throw new ApiError(403, "Unauthorized to cancel this shipment");
    }

    // Check if order is already cancelled
    if (order.orderStatus === "cancelled") {
        throw new ApiError(400, "Order is already cancelled");
    }

    // Check shipment status
    const shipmentDetails = await shiprocketService.getShipmentDetails(shipmentId);

    const shipmentStatus = shipmentDetails.shipment_status?.toLowerCase() || "pending";

    // Prevent cancellation if already picked up or shipped
    if (["picked", "shipped", "in_transit", "delivered"].includes(shipmentStatus)) {
        throw new ApiError(
            400,
            `Order cancellation is no longer available because the shipment has already been processed/shipped. For support, contact us on WhatsApp: ${env.whatsappNumber}`
        );
    }

    try {
        // Cancel in Shiprocket
        await shiprocketService.cancelShipment(shipmentId);

        // Update order in database
        order.orderStatus = "cancelled";
        order.shipmentStatus = "cancelled";
        order.cancellationReason = "Customer requested cancellation";
        order.cancellationDate = new Date();
        order.refundStatus = "none"; // NO refund - advance is non-refundable
        await order.save();

        console.log(`✅ Order cancelled successfully: ${order._id}`);

        // Return response with policy message
        sendSuccess(
            res,
            { order },
            `Your order has been cancelled successfully. Please note that the 30% advance payment (₹${order.advanceAmount}) is non-refundable due to shipping and operational charges. For further assistance, contact us on WhatsApp: ${env.whatsappNumber}`
        );
    } catch (error: any) {
        console.error("❌ Shipment cancellation error:", error.message);
        throw error;
    }
});

/**
 * Get shipment details
 * GET /api/shipping/:shipmentId
 */
export const getShipmentDetails = asyncHandler(async (req: Request, res: Response) => {
    const { shipmentId } = req.params;

    if (!shipmentId) {
        throw new ApiError(400, "Shipment ID is required");
    }

    const details = await shiprocketService.getShipmentDetails(shipmentId);
    sendSuccess(res, { shipment: details }, "Shipment details retrieved");
});

/**
 * Manual shipment creation (admin only)
 * POST /api/shipping/create
 * Used if automatic creation during payment fails
 */
export const createShipment = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    // Fetch order
    const order = await Order.findById(orderId).populate("user");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if shipment already exists
    if (order.shipmentId) {
        throw new ApiError(400, "Shipment already created for this order");
    }

    // Check if advance payment is done
    if (!order.paymentInfo.advancePaid) {
        throw new ApiError(400, "Advance payment not completed. Cannot create shipment.");
    }

    // Create shipment
    const shipmentResult = await shiprocketService.createShipment({
        orderId: order._id.toString(),
        totalAmount: order.totalAmount,
        codAmount: order.remainingCOD, // 70% COD amount
        subTotal: order.totalAmount,
        customerName: order.shippingInfo.name,
        customerEmail: (order.user as any).email,
        customerPhone: order.shippingInfo.phone,
        address: order.shippingInfo.address,
        city: order.shippingInfo.city,
        state: order.shippingInfo.state,
        postalCode: order.shippingInfo.postalCode,
        country: order.shippingInfo.country,
        items: order.orderedProducts.map((p) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
        })),
    });

    // Update order with shipment details
    order.shipmentId = shipmentResult.shipmentId;
    order.shiprocketOrderId = shipmentResult.orderId;
    order.trackingId = shipmentResult.trackingId;
    order.shipmentStatus = "pending";
    order.orderStatus = "processing";
    await order.save();

    console.log(`✅ Shipment created manually for order: ${orderId}`);

    sendSuccess(
        res,
        {
            shipment: {
                shipmentId: shipmentResult.shipmentId,
                trackingId: shipmentResult.trackingId,
                courierPartner: shipmentResult.courierPartnerName,
            },
            order,
        },
        "Shipment created successfully"
    );
});
