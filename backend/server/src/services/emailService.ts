import { mailTransporter } from "../config/mail";
import { OrderDocument } from "../models/Order";

export const sendEmail = async (to: string, subject: string, html: string) => {
  await mailTransporter.sendMail({
    from: "Morfyx Studio <onboarding@resend.dev>",
    to,
    subject,
    html
  });
};

export const templates = {
  welcome: (name: string) => `
    <div>
      <h2>Welcome to Morfyx Studio</h2>
      <p>Hi ${name}, your account is ready.</p>
    </div>
  `,
  orderConfirmation: (orderId: string) => `
    <div>
      <h2>Order confirmed</h2>
      <p>Your order ${orderId} has been placed.</p>
    </div>
  `,
  paymentConfirmation: (order: OrderDocument) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2563eb;">💰 Payment Received</h2>
      
      <p>Hi <strong>${order.shippingInfo.name}</strong>,</p>
      
      <p>Thank you for your payment! Your order is now being processed for shipment.</p>
      
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Order Details</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      
      <h3 style="color: #1e40af;">Products Ordered:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f3f4f6; border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 10px;">Product</th>
          <th style="text-align: center; padding: 10px;">Qty</th>
          <th style="text-align: right; padding: 10px;">Price</th>
          <th style="text-align: right; padding: 10px;">Total</th>
        </tr>
        ${order.orderedProducts.map(p => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">${p.name}</td>
            <td style="text-align: center; padding: 10px;">${p.quantity}</td>
            <td style="text-align: right; padding: 10px;">₹${p.price}</td>
            <td style="text-align: right; padding: 10px; font-weight: bold;">₹${p.price * p.quantity}</td>
          </tr>
        `).join('')}
      </table>
      
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #166534;">Payment Breakdown</h3>
        <p><strong style="color: #10b981;">✓ Advance Paid (30%):</strong> ₹${order.advanceAmount}</p>
        <p><strong style="color: #2563eb;">⏳ Remaining COD (70%):</strong> ₹${order.remainingCOD}</p>
        <p style="margin-top: 10px; font-weight: bold; border-top: 1px solid #86efac; padding-top: 10px;">Total: ₹${order.totalAmount}</p>
        <p style="font-size: 12px; color: #16a34a; margin-top: 8px;">💡 The remaining 70% will be collected when your package is delivered.</p>
      </div>
      
      <h3 style="color: #1e40af;">Delivery Address:</h3>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px;">
        <p><strong>${order.shippingInfo.name}</strong></p>
        <p>${order.shippingInfo.address}</p>
        <p>${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postalCode}</p>
        <p>${order.shippingInfo.country}</p>
        <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px; color: #666;">Your shipment will be ready soon. Track your order using the tracking ID provided in the next email.</p>
      
      <p style="margin-top: 20px;">Best regards,<br><strong>Morfyx Studio</strong></p>
    </div>
  `,
  shipmentTracking: (order: OrderDocument, trackingId: string) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2563eb;">📦 Your Order is On The Way!</h2>
      
      <p>Hi <strong>${order.shippingInfo.name}</strong>,</p>
      
      <p>Great news! Your order has been handed to our courier partner and is on its way to you.</p>
      
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Tracking Information</h3>
        <p><strong>Tracking ID:</strong> <span style="font-size: 16px; color: #2563eb;">${trackingId}</span></p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">Use the tracking ID above to track your shipment in real-time on the courier website.</p>
      </div>
      
      <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #854d0e;">⏳ Reminder: COD Payment Due</h3>
        <p><strong>Amount Due on Delivery: ₹${order.remainingCOD}</strong></p>
        <p>Please keep the exact amount ready when the package arrives. The delivery partner will collect the remaining 70% payment.</p>
      </div>
      
      <h3 style="color: #1e40af;">Delivery Details:</h3>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px;">
        <p><strong>${order.shippingInfo.name}</strong></p>
        <p>${order.shippingInfo.address}</p>
        <p>${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postalCode}</p>
        <p><strong>Contact:</strong> ${order.shippingInfo.phone}</p>
      </div>
      
      <p style="margin-top: 20px;">Questions? We're here to help!</p>
      
      <p style="margin-top: 20px;">Best regards,<br><strong>Morfyx Studio</strong></p>
    </div>
  `,
  passwordReset: (resetUrl: string) => `
    <div>
      <h2>Reset your password</h2>
      <p>Click the link to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
  `,
  adminOrderNotification: (orderId: string, customerName: string, totalAmount: number) => `
    <div>
      <h2>🎉 New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
      <p><a href="https://admin.morfyx.com/orders/${orderId}">View Order in Admin Panel</a></p>
    </div>
  `,
  adminPaymentNotification: (order: OrderDocument) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2563eb;">💰 Payment Received & Ready to Ship</h2>
      
      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #166534;">Order Summary</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${order.shippingInfo.name}</p>
        <p><strong>Email:</strong> ${(order.user as any)?.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
      </div>
      
      <h3 style="color: #1e40af;">Products to Ship:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f3f4f6; border-bottom: 1px solid #e5e7eb;">
          <th style="text-align: left; padding: 10px;">Product</th>
          <th style="text-align: center; padding: 10px;">Qty</th>
          <th style="text-align: right; padding: 10px;">Price</th>
          <th style="text-align: right; padding: 10px;">Total</th>
        </tr>
        ${order.orderedProducts.map(p => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px;">${p.name}</td>
            <td style="text-align: center; padding: 10px;">${p.quantity}</td>
            <td style="text-align: right; padding: 10px;">₹${p.price}</td>
            <td style="text-align: right; padding: 10px; font-weight: bold;">₹${p.price * p.quantity}</td>
          </tr>
        `).join('')}
      </table>
      
      <h3 style="color: #1e40af;">Delivery Address:</h3>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px;">
        <p><strong>${order.shippingInfo.name}</strong></p>
        <p>${order.shippingInfo.address}</p>
        <p>${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.postalCode}</p>
        <p>${order.shippingInfo.country}</p>
        <p><strong>Contact:</strong> ${order.shippingInfo.phone}</p>
      </div>
      
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Payment Status</h3>
        <p><strong style="color: #10b981;">✓ Advance Paid (30%):</strong> ₹${order.advanceAmount}</p>
        <p><strong style="color: #2563eb;">COD to Collect (70%):</strong> ₹${order.remainingCOD}</p>
        <p style="font-weight: bold; border-top: 1px solid #dbeafe; padding-top: 10px; margin-top: 10px;">Total: ₹${order.totalAmount}</p>
      </div>
      
      <p style="margin-top: 20px;">The Shiprocket shipment has been automatically created. Please proceed with packing and preparing for pickup.</p>
      
      <p style="margin-top: 20px;"><a href="https://admin.morfyx.com/orders/${order._id}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Admin Panel</a></p>
    </div>
  `
};
