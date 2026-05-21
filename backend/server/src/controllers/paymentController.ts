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
import { Order, OrderDocument } from "../models/Order";
import { updateStockAfterPayment } from "../services/orderService";

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

    // Update product stock after successful payment
    try {
      await updateStockAfterPayment(orderId);
      console.log("✅ Product stock updated successfully");
    } catch (stockError: any) {
      console.error("⚠️ Stock update failed:", stockError.message);
      // Don't throw - stock update should not block payment verification
    }

    const user = (order.user as any);
    const userId = user?._id ? String(user._id) : String(order.user);
    const customerName = user?.name || order.shippingInfo.name;

    // Create notification as a best-effort side effect so payment verification
    // can still complete even if notification persistence fails.
    try {
      await createNotification({
        userId,
        type: "order",
        title: "Payment verified and order placed",
        message: `Hi ${customerName}, we verified your payment of ₹${advanceAmount}. Your order is now confirmed and the remaining ₹${remainingCOD} will be collected on delivery.`,
        data: {
          orderId: order._id,
          paymentStatus: "paid",
          orderStatus: "processing",
          advanceAmount,
          remainingCOD
        },
      });
    } catch (notificationError) {
      console.error("⚠️ Failed to create payment notification:", notificationError);
    }

    try {
      await createNotification({
        type: "order",
        title: "Order placed and payment verified",
        message: `Order ${order._id} is paid and ready for shipment processing.`,
        data: {
          orderId: order._id,
          paymentStatus: "paid",
          orderStatus: "processing",
          advanceAmount,
          remainingCOD,
          audience: "admin"
        }
      });
    } catch (notificationError) {
      console.error("⚠️ Failed to create admin payment notification:", notificationError);
    }

    // Send payment confirmation email
    let userEmail = (order.customerEmail || user?.email) as string | undefined;
    if (!userEmail) {
      const fallbackUser = await User.findById(order.user).select("email");
      userEmail = fallbackUser?.email;
    }

    if (userEmail) {
      try {
        // Send payment confirmation to user asynchronously so verification API isn't delayed
        sendEmail(
          userEmail,
          "Payment Received - Shipment Processing",
          templates.paymentConfirmation(order as OrderDocument)
        )
          .then(info => console.log(`✉️ Payment confirmation email queued to ${userEmail} — messageId: ${info?.messageId}`))
          .catch(emailError => console.error(`❌ Failed to send payment email:`, emailError));
      } catch (emailError) {
        console.error(`❌ Failed to start payment email send:`, emailError);
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
        customerEmail: userEmail || "noreply@morfyx.com",
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

      try {
        await createNotification({
          userId,
          type: "shipment",
          title: "Order ready to ship",
          message: `Your order is confirmed and ready to ship. Tracking ID: ${shipmentResult.trackingId || shipmentResult.shipmentId}.`,
          data: {
            orderId: order._id,
            trackingId: shipmentResult.trackingId || shipmentResult.shipmentId,
            shipmentId: shipmentResult.shipmentId,
            orderStatus: order.orderStatus,
            shipmentStatus: order.shipmentStatus
          },
        });
      } catch (notificationError) {
        console.error("⚠️ Failed to create shipment notification:", notificationError);
      }

      try {
        await createNotification({
          type: "shipment",
          title: "Order ready to ship",
          message: `Order ${order._id} is ready to ship with tracking ID ${shipmentResult.trackingId || shipmentResult.shipmentId}.`,
          data: {
            orderId: order._id,
            trackingId: shipmentResult.trackingId || shipmentResult.shipmentId,
            shipmentId: shipmentResult.shipmentId,
            orderStatus: order.orderStatus,
            shipmentStatus: order.shipmentStatus,
            audience: "admin"
          },
        });
      } catch (notificationError) {
        console.error("⚠️ Failed to create admin shipment notification:", notificationError);
      }

      // Send shipment confirmation email (async)
      if (userEmail) {
        try {
          sendEmail(
            userEmail,
            "Order Shipped",
            templates.shipmentTracking(order as OrderDocument, shipmentResult.trackingId || shipmentResult.shipmentId)
          )
            .then(info => console.log(`✉️ Shipment confirmation email queued to ${userEmail} — messageId: ${info?.messageId}`))
            .catch(emailError => console.error(`❌ Failed to send shipment email:`, emailError));
        } catch (emailError) {
          console.error(`❌ Failed to start shipment email send:`, emailError);
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
      sendSuccess(res, { order, shipment: shipmentResult }, "Payment verified and order placed");
    } catch (shipmentError: any) {
      console.error("⚠️  Shipment creation failed:", shipmentError.message);
      console.error("⚠️  Order remains in 'processing' state. Shipment can be created manually by admin.");

      order.orderStatus = "processing";
      order.shipmentStatus = "pending";
      await order.save();

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
        "Payment verified and order placed. Shipment will be created shortly."
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
