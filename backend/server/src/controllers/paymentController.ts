import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { createRazorpayOrder, recordPaymentFailure, recordPaymentSuccess, verifyRazorpaySignature } from "../services/paymentService";
import { createNotification } from "../services/notificationService";
import { shiprocketService } from "../services/shiprocketService";
import { User } from "../models/User";
import { sendEmail, templates } from "../services/emailService";
import { Order } from "../models/Order";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.body;

  console.log("🔵 Creating Razorpay order with amount (in paise):", amount);
  console.log("🔵 Razorpay Key ID configured:", env.razorpayKeyId ? "✅ YES" : "❌ NO");

  if (!amount) {
    console.error("❌ Amount is missing from request body");
    throw new ApiError(400, "Amount required");
  }

  try {
    const order = await createRazorpayOrder(Number(amount));
    console.log("✅ Razorpay order created successfully:", order.id);
    sendSuccess(res, { razorpayOrderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error: any) {
    console.error("❌ Razorpay order creation failed:", error.message || error);
    console.error("❌ Full error:", JSON.stringify(error, null, 2));
    throw new ApiError(500, `Failed to create Razorpay order: ${error.message}`);
  }
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    console.log("🔵 Verifying payment with:");
    console.log("  - razorpayOrderId:", razorpayOrderId);
    console.log("  - razorpayPaymentId:", razorpayPaymentId);
    console.log("  - orderId:", orderId);

    if (!orderId) {
      console.error("❌ Missing orderId in verification request");
      throw new ApiError(400, "Order ID required");
    }

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      env.razorpayKeySecret
    );

    if (!isValid) {
      console.error("❌ Invalid payment signature");
      throw new ApiError(400, "Invalid payment signature");
    }

    console.log("✅ Razorpay signature verified");

    // Fetch order
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Record Razorpay payment
    const advanceAmount = Math.round(order.totalAmount * (env.advancePaymentPercent / 100));
    const remainingCOD = order.totalAmount - advanceAmount;

    order.advanceAmount = advanceAmount;
    order.remainingCOD = remainingCOD;
    order.paymentInfo = {
      provider: "razorpay",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      status: "paid",
      advancePaid: true,
    };
    order.orderStatus = "paid";
    await order.save();

    console.log(`✅ Payment recorded: Advance ₹${advanceAmount}, COD ₹${remainingCOD}`);

    // Create notification
    await createNotification({
      userId: String(order.user),
      type: "payment",
      title: "Advance payment received",
      message: `₹${advanceAmount} received. Remaining ₹${remainingCOD} COD.`,
      data: { orderId: order._id },
    });

    const user = (order.user as any);

    // Send payment confirmation email
    if (user?.email) {
      try {
        await sendEmail(
          user.email,
          "Payment Received - Shipment Processing",
          templates.paymentConfirmation(order as OrderDocument)
        );
        console.log(`✅ Payment confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send payment email:`, emailError);
      }
    }

    // Create Shiprocket shipment
    console.log("🔵 Creating Shiprocket shipment with COD...");
    try {
      const shipmentResult = await shiprocketService.createShipment({
        orderId: order._id.toString(),
        totalAmount: order.totalAmount,
        codAmount: remainingCOD, // Only 70% as COD
        subTotal: order.totalAmount,
        customerName: order.shippingInfo.name,
        customerEmail: user?.email || "noreply@morfyx.com",
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

      console.log(`✅ Shiprocket shipment created: ${shipmentResult.shipmentId}`);

      // Send shipment confirmation email
      if (user?.email) {
        try {
          await sendEmail(
            user.email,
            "Order Shipped",
            templates.shipmentTracking(order as OrderDocument, shipmentResult.trackingId || shipmentResult.shipmentId)
          );
          console.log(`✅ Shipment confirmation email sent to ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send shipment email:`, emailError);
        }
      }

      // Send admin notification
      try {
        await sendEmail(
          env.adminEmail,
          "New Order Received - Ready to Ship",
          templates.adminPaymentNotification(order as OrderDocument)
        );
        console.log(`✅ Admin notification sent`);
      } catch (emailError) {
        console.error(`❌ Failed to send admin email:`, emailError);
      }

      console.log("✅ Payment verification complete with shipment!");
      sendSuccess(res, { order, shipment: shipmentResult }, "Payment verified and shipment created");
    } catch (shipmentError: any) {
      console.error("⚠️  Shipment creation failed:", shipmentError.message);
      console.error("⚠️  Order remains in 'processing' state. Shipment can be created manually by admin.");

      // Send notification to admin to create shipment manually
      try {
        await sendEmail(
          env.adminEmail,
          "⚠️ Manual Shipment Required",
          `Order ${order._id} paid successfully but Shiprocket shipment creation failed. Please create shipment manually.`
        );
      } catch (e) {
        console.error("Failed to send admin alert");
      }

      // Still return success - order is paid, shipment can be retried
      sendSuccess(
        res,
        { order },
        "Payment verified successfully. Shipment will be created shortly."
      );
    }
  } catch (error: any) {
    console.error("❌ Payment verification failed:", error.message);
    throw error;
  }
});

export const paymentFailed = asyncHandler(async (req: Request, res: Response) => {
  await recordPaymentFailure(req.body);
  sendSuccess(res, {}, "Payment failure recorded");
});
