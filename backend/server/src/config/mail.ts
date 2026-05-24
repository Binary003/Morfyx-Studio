import { env } from "./env";

if (!env.emailApiKey) {
  throw new Error("EMAIL_API_KEY is required for email delivery");
}

export type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendResendEmail(payload: MailPayload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.emailApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Morfyx Studio <${env.emailFrom}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html
      }),
      signal: controller.signal
    });

    const responseBody = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMessage = responseBody?.message || responseBody?.error || `Resend API error (${response.status})`;
      throw new Error(errorMessage);
    }

    return responseBody;
  } finally {
    clearTimeout(timeout);
  }
}
