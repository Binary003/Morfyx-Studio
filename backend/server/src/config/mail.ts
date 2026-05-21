import nodemailer from "nodemailer";
import { env } from "./env";

let mailTransporter: nodemailer.Transporter;

if (env.emailService === "resend" && env.emailApiKey) {
  // Use Resend for production
  mailTransporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
      user: "resend",
      pass: env.emailApiKey
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000
  });
} else {
  // Fallback to Gmail
  mailTransporter = nodemailer.createTransport({
    service: "gmail",
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    auth: {
      user: env.emailUser,
      pass: env.emailPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000
  });
}

export { mailTransporter };
