import httpStatus from "http-status";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { PAYMENT_GATEWAYS, WALLET_TRANSACTION_TYPES, WALLET_TRANSACTION_STATUS } from "../utils/constants.js";
import { createWalletTransaction, getWalletSnapshot } from "../services/walletService.js";
import { createPayULaunchUrl, createPayURequest, isPayUConfigured, isPayUMockEnabled } from "../services/payuService.js";
import { WalletTransaction } from "../models/WalletTransaction.js";
import { User } from "../models/User.js";

const createTransactionId = () => `RMW${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
const toPayURecord = (transaction) => ({
  _id: transaction._id,
  amount: transaction.amount,
  items: [{ name: "RisheeMuni wallet recharge" }],
  payuTransactionId: transaction.metadata?.payuTransactionId,
  notes: {}
});

export const getWalletDetails = asyncHandler(async (req, res) => {
  const { user, transactions } = await getWalletSnapshot(req.user.id);
  return successResponse(res, {
    balance: user?.walletBalance || 0,
    currency: user?.walletCurrency || "INR",
    transactions
  });
});

export const initiateWalletTopUp = asyncHandler(async (req, res) => {
  const amount = Number(req.body?.amount);
  const platform = req.body?.platform === "mobile" ? "mobile" : "web";
  if (!Number.isFinite(amount) || amount < 100) {
    throw Object.assign(new Error("Top-up amount must be at least 100"), { statusCode: httpStatus.BAD_REQUEST });
  }
  if (!isPayUConfigured() && !isPayUMockEnabled()) {
    throw Object.assign(new Error("PayU is not configured"), { statusCode: httpStatus.SERVICE_UNAVAILABLE });
  }

  const payuTransactionId = createTransactionId();
  const transaction = await createWalletTransaction({
    userId: req.user.id,
    amount,
    currency: "INR",
    type: WALLET_TRANSACTION_TYPES.CREDIT,
    gateway: PAYMENT_GATEWAYS.PAYU,
    description: "Wallet recharge via PayU",
    metadata: { payuTransactionId, platform }
  });
  const user = await User.findById(req.user.id);
  const payment = {
    ...createPayURequest({ order: toPayURecord(transaction), user, platform }),
    checkoutUrl: createPayULaunchUrl({
      resourceId: transaction._id,
      platform,
      purpose: "wallet_topup"
    })
  };

  return successResponse(res, { transactionId: transaction._id, payment }, "Wallet top-up initiated", httpStatus.CREATED);
});

export const confirmWalletTopUp = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await WalletTransaction.findOne({ _id: transactionId, userId: req.user.id });
  if (!transaction) {
    throw Object.assign(new Error("Transaction not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  if (transaction.status === WALLET_TRANSACTION_STATUS.SUCCESS) {
    const { user } = await getWalletSnapshot(req.user.id, 5);
    return successResponse(res, { balance: user.walletBalance, currency: user.walletCurrency }, "Wallet updated");
  }

  throw Object.assign(new Error("Wallet recharge is verified automatically by PayU"), {
    statusCode: httpStatus.BAD_REQUEST
  });
});
