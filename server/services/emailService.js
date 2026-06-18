import { Resend } from "resend";
import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

let resendClient;
let transporter;

const getResendClient = () => {
  if (resendClient) return resendClient;
  if (!process.env.RESEND_API_KEY) return null;
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });
  return transporter;
};

const getFromAddress = () =>
  process.env.EMAIL_FROM || "RisheeMuni <noreply@risheemuni.in>";

const sendWithResend = async ({ to, subject, html }) => {
  const client = getResendClient();
  if (!client) return null;

  const { data, error } = await client.emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    html
  });

  if (error) {
    throw new Error(error.message || "Resend email failed");
  }

  return { success: true, messageId: data?.id, provider: "resend" };
};

const sendWithSmtp = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) return null;

  const info = await transport.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html
  });

  return { success: true, messageId: info.messageId, provider: "smtp" };
};

export const isEmailConfigured = () =>
  Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = (await sendWithResend({ to, subject, html }))
      || (await sendWithSmtp({ to, subject, html }));

    if (result) {
      logger.info("Email dispatched", {
        to,
        subject,
        messageId: result.messageId,
        provider: result.provider
      });
      return result;
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("Email provider is not configured");
    }

    logger.info("Email captured by development logger", { to, subject });
    return { success: true, mocked: true };
  } catch (error) {
    logger.error("Email dispatch failed", { to, subject, error: error.message });
    throw error;
  }
};
