import nodemailer from "nodemailer";
import { env } from "./env";

let mailTransporter;

if (env.emailService === "resend" && env.emailApiKey) {
  // Use Resend for production
  mailTransporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: "resend",
      pass: env.emailApiKey
    }
  });
} else {
  // Fallback to Gmail
  mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass
    }
  });
}

export { mailTransporter };
