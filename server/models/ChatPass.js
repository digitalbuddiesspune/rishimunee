import mongoose from "mongoose";

// Represents a time-bound chat access pass (per-minute booking) purchased by a user for a specific astrologer
const chatPassSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    astrologerId: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer", required: true },
    // Duration booked in minutes (e.g., 1, 5, 10, etc.)
    durationMinutes: { type: Number, required: true },
    // Activation timestamp when user starts using the pass (first chat)
    activatedAt: { type: Date },
    // Expiry computed as activatedAt + durationMinutes. Set on activation.
    validUntil: { type: Date },
    priceCharged: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" }
  },
  { timestamps: true }
);

chatPassSchema.index({ userId: 1, astrologerId: 1, validUntil: -1 });
chatPassSchema.index({ userId: 1, astrologerId: 1, activatedAt: -1 });

export const ChatPass = mongoose.model("ChatPass", chatPassSchema);

