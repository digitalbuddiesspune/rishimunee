import httpStatus from "http-status";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { WALLET_TRANSACTION_STATUS, WALLET_TRANSACTION_TYPES } from "../utils/constants.js";

export const createWalletTransaction = async ({
  userId,
  amount,
  currency = "INR",
  type,
  gateway,
  description,
  metadata
}) => {
  return WalletTransaction.create({
    userId,
    amount,
    currency,
    type,
    gateway,
    description,
    metadata
  });
};

export const markWalletTransactionSuccess = async ({ transactionId, referenceId, metadata }) => {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findById(transactionId).session(session);
      if (!transaction) {
        const error = new Error("Wallet transaction not found");
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
      }
      if (transaction.status === WALLET_TRANSACTION_STATUS.SUCCESS) {
        result = transaction;
        return;
      }

      transaction.status = WALLET_TRANSACTION_STATUS.SUCCESS;
      transaction.referenceId = referenceId;
      transaction.metadata = { ...transaction.metadata, ...metadata };

      if (transaction.type === WALLET_TRANSACTION_TYPES.CREDIT) {
        const user = await User.findByIdAndUpdate(
          transaction.userId,
          { $inc: { walletBalance: transaction.amount } },
          { new: true, session }
        );
        transaction.balanceAfter = user.walletBalance;
      }

      await transaction.save({ session });
      result = transaction;
    });
    return result;
  } finally {
    await session.endSession();
  }
};

export const markWalletTransactionFailed = async ({ transactionId, metadata }) => {
  const transaction = await WalletTransaction.findById(transactionId);
  if (!transaction || transaction.status === WALLET_TRANSACTION_STATUS.SUCCESS) {
    return transaction;
  }
  transaction.status = WALLET_TRANSACTION_STATUS.FAILED;
  transaction.metadata = { ...transaction.metadata, ...metadata };
  await transaction.save();
  return transaction;
};

export const debitWallet = async ({ userId, amount, description, referenceId, metadata }) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount } },
    { new: true }
  );
  if (!user) {
    const error = new Error("Insufficient wallet balance");
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const transaction = await WalletTransaction.create({
    userId,
    amount,
    currency: user.walletCurrency || "INR",
    type: WALLET_TRANSACTION_TYPES.DEBIT,
    status: WALLET_TRANSACTION_STATUS.SUCCESS,
    gateway: "wallet",
    description,
    referenceId,
    balanceAfter: user.walletBalance,
    metadata
  });

  return { user, transaction };
};

export const getWalletSnapshot = async (userId, limit = 20) => {
  const [user, transactions] = await Promise.all([
    User.findById(userId, "walletBalance walletCurrency"),
    WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(limit)
  ]);
  return { user, transactions };
};
