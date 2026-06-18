import mongoose from "mongoose";
import { WALLET_TRANSACTION_STATUS, WALLET_TRANSACTION_TYPES, PAYMENT_GATEWAYS } from "../utils/constants.js";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    type: {
      type: String,
      enum: Object.values(WALLET_TRANSACTION_TYPES),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WALLET_TRANSACTION_STATUS),
      default: WALLET_TRANSACTION_STATUS.PENDING
    },
    gateway: {
      type: String,
      enum: [...Object.values(PAYMENT_GATEWAYS), "wallet"],
      default: PAYMENT_GATEWAYS.RAZORPAY
    },
    referenceId: { type: String },
    description: { type: String },
    balanceAfter: { type: Number },
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
