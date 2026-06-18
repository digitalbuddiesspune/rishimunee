import crypto from "crypto";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { OtpChallenge } from "../models/OtpChallenge.js";
import { sendEmail } from "./emailService.js";
import { buildOtpVerificationEmail } from "../templates/otpVerificationEmail.js";
import { logger } from "../utils/logger.js";

const ttlMinutes = Math.max(2, Number(process.env.OTP_TTL_MINUTES) || 10);
const resendSeconds = Math.max(15, Number(process.env.OTP_RESEND_SECONDS) || 60);
const maxAttempts = Math.max(3, Number(process.env.OTP_MAX_ATTEMPTS) || 5);
const stubEnabled = process.env.NODE_ENV !== "production" && process.env.EMAIL_OTP_STUB === "true";

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const otpHtml = (otp) =>
  buildOtpVerificationEmail({
    otp,
    ttlMinutes,
    clientUrl: process.env.CLIENT_URL?.split(",")?.[0]?.trim() || "https://www.risheemuni.in"
  });

export const createOtpChallenge = async ({ email, purpose, payload = {} }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const now = new Date();
  const recent = await OtpChallenge.findOne({
    email: normalizedEmail,
    purpose,
    consumedAt: null,
    resendAvailableAt: { $gt: now }
  }).sort({ createdAt: -1 });
  if (recent) {
    throw Object.assign(new Error("Please wait before requesting another code"), {
      statusCode: httpStatus.TOO_MANY_REQUESTS
    });
  }
  const otp = generateOtp();
  const challenge = await OtpChallenge.create({
    email: normalizedEmail,
    purpose,
    otpHash: await bcrypt.hash(otp, 10),
    payload,
    maxAttempts,
    expiresAt: new Date(now.getTime() + ttlMinutes * 60 * 1000),
    resendAvailableAt: new Date(now.getTime() + resendSeconds * 1000)
  });

  await sendEmail({
    to: normalizedEmail,
    subject: "Your RisheeMuni verification code",
    html: otpHtml(otp)
  });

  if (stubEnabled) {
    logger.info("Development OTP generated", { email: normalizedEmail, purpose, otp });
  }

  return {
    challengeId: challenge._id,
    expiresInSeconds: ttlMinutes * 60,
    resendAfterSeconds: resendSeconds,
    ...(stubEnabled ? { stubOtp: otp } : {})
  };
};

export const verifyOtpChallenge = async ({ challengeId, otp, purpose }) => {
  const challenge = await OtpChallenge.findById(challengeId);
  if (!challenge || challenge.purpose !== purpose || challenge.consumedAt) {
    throw Object.assign(new Error("Verification request is invalid or already used"), {
      statusCode: httpStatus.BAD_REQUEST
    });
  }
  if (challenge.expiresAt <= new Date()) {
    throw Object.assign(new Error("Verification code has expired"), { statusCode: httpStatus.BAD_REQUEST });
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    throw Object.assign(new Error("Too many incorrect attempts"), { statusCode: httpStatus.TOO_MANY_REQUESTS });
  }

  const matches = await bcrypt.compare(String(otp || ""), challenge.otpHash);
  if (!matches) {
    await OtpChallenge.updateOne(
      { _id: challenge._id, consumedAt: null },
      { $inc: { attempts: 1 } }
    );
    throw Object.assign(new Error("Incorrect verification code"), { statusCode: httpStatus.BAD_REQUEST });
  }

  const consumed = await OtpChallenge.findOneAndUpdate(
    { _id: challenge._id, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
    { new: true }
  );
  if (!consumed) {
    throw Object.assign(new Error("Verification request is invalid or already used"), {
      statusCode: httpStatus.BAD_REQUEST
    });
  }
  return consumed;
};

export const resendOtpChallenge = async ({ challengeId }) => {
  const existing = await OtpChallenge.findById(challengeId);
  if (!existing || existing.consumedAt) {
    throw Object.assign(new Error("Verification request is invalid or already used"), {
      statusCode: httpStatus.BAD_REQUEST
    });
  }
  if (existing.resendAvailableAt > new Date()) {
    throw Object.assign(new Error("Please wait before requesting another code"), {
      statusCode: httpStatus.TOO_MANY_REQUESTS
    });
  }
  existing.consumedAt = new Date();
  await existing.save();
  return createOtpChallenge({
    email: existing.email,
    purpose: existing.purpose,
    payload: existing.payload
  });
};
