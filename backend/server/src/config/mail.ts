import nodemailer from "nodemailer";
import { env } from "./env";

let mailTransporter: nodemailer.Transporter;

if (!env.emailApiKey) {
  throw new Error("EMAIL_API_KEY is required for email delivery");
}

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

export { mailTransporter };
