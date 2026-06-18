import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    purpose: { type: String, enum: ["register", "login"], required: true },
    otpHash: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    resendAvailableAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const OtpChallenge = mongoose.model("OtpChallenge", otpChallengeSchema);

