import { mailTransporter } from "../config/mail";

export const sendEmail = async (to: string, subject: string, html: string) => {
  await mailTransporter.sendMail({
    from: "Morfyx Studio <no-reply@morfyx.studio>",
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
  paymentConfirmation: (orderId: string) => `
    <div>
      <h2>Payment received</h2>
      <p>Your payment for order ${orderId} is successful.</p>
    </div>
  `,
  shipmentTracking: (trackingId: string) => `
    <div>
      <h2>Shipment created</h2>
      <p>Your tracking ID is ${trackingId}.</p>
    </div>
  `,
  passwordReset: (resetUrl: string) => `
    <div>
      <h2>Reset your password</h2>
      <p>Click the link to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    </div>
  `
};
