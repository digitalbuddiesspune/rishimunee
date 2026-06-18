import httpStatus from "http-status";
import dayjs from "dayjs";
import { Astrologer } from "../models/Astrologer.js";
import { ChatPass } from "../models/ChatPass.js";
import { debitWallet } from "./walletService.js";

const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// Fetch per-minute rate for an astrologer with a floor of Rs. 100
export const getAstrologerPerMinuteRate = async (astrologerId) => {
  const astro = await Astrologer.findById(astrologerId, "pricePerMinute name");
  if (!astro) {
    const err = new Error("Astrologer not found");
    err.statusCode = httpStatus.NOT_FOUND;
    throw err;
  }
  // Enforce a minimum per-minute rate of Rs. 100
  const base = Math.max(100, toNumber(astro.pricePerMinute, 0) || 0);
  return { rate: base, astrologer: astro };
};

export const getActiveChatPass = async ({ userId, astrologerId, now = new Date() }) => {
  // Active means not yet expired; supports legacy passes that didn't set activatedAt
  return ChatPass.findOne({ userId, astrologerId, validUntil: { $gt: now } }).sort({ validUntil: -1 });
};

export const checkTimeAccess = async ({ userId, astrologerId }) => {
  const now = new Date();
  const existing = await getActiveChatPass({ userId, astrologerId, now });
  if (existing) {
    return { hasAccess: true, pass: existing, price: 0, validUntil: existing.validUntil };
  }
  // If there's a purchased (pending) pass that isn't activated yet, allow starting the session.
  // Be strict: only count passes that were actually paid for and carry usable minutes.
  // Activation will occur on first message via ensureActiveTimePass.
  const pending = await ChatPass.findOne({
    userId,
    astrologerId,
    activatedAt: null,
    validUntil: null,
    durationMinutes: { $gt: 0 },
    priceCharged: { $gt: 0 },
    transactionId: { $ne: null }
  }).sort({ createdAt: -1 });
  if (pending) {
    return { hasAccess: true, pass: pending, price: 0, pendingActivation: true };
  }
  const { rate, astrologer } = await getAstrologerPerMinuteRate(astrologerId);
  return { hasAccess: false, rate, astrologerName: astrologer.name };
};

export const quoteTimeAccess = async ({ astrologerId, minutes }) => {
  const allowed = [1, 5, 10, 15, 30];
  const mins = allowed.includes(Number(minutes)) ? Number(minutes) : 5;
  const { rate } = await getAstrologerPerMinuteRate(astrologerId);
  const price = Math.round(rate * mins);
  return { minutes: mins, price, rate };
};

export const purchaseTimeAccess = async ({ userId, astrologerId, minutes }) => {
  const now = new Date();
  // If there's an existing active pass, simply return it
  const existing = await getActiveChatPass({ userId, astrologerId, now });
  if (existing) return { hasAccess: true, pass: existing, charged: false };

  const { minutes: mins, price, rate } = await quoteTimeAccess({ astrologerId, minutes });
  try {
    const description = `${mins} min chat with astrologer`;
    const { transaction } = await debitWallet({ userId, amount: price, description, metadata: { astrologerId: astrologerId.toString(), purpose: "chat_pass_minutes", minutes: mins, rate } });
    const pass = await ChatPass.create({
      userId,
      astrologerId,
      durationMinutes: mins,
      activatedAt: null,
      validUntil: null,
      priceCharged: price,
      currency: transaction.currency || "INR",
      transactionId: transaction._id
    });
    return { hasAccess: true, pass, charged: true };
  } catch (err) {
    err.statusCode = httpStatus.PAYMENT_REQUIRED;
    err.code = "WALLET_INSUFFICIENT";
    const q = await quoteTimeAccess({ astrologerId, minutes });
    err.requiredAmount = q.price;
    throw err;
  }
};

export const ensureActiveTimePass = async ({ userId, astrologerId }) => {
  const now = new Date();
  // If already active and valid, allow
  const active = await getActiveChatPass({ userId, astrologerId, now });
  if (active) return { hasAccess: true, pass: active };
  // Try to activate a purchased but not-yet-activated pass
  const pending = await ChatPass.findOne({ userId, astrologerId, activatedAt: null, durationMinutes: { $gt: 0 } }).sort({ createdAt: -1 });
  if (pending) {
    const activatedAt = now;
    const validUntil = dayjs(activatedAt).add(pending.durationMinutes, "minute").toDate();
    pending.activatedAt = activatedAt;
    pending.validUntil = validUntil;
    await pending.save();
    return { hasAccess: true, pass: pending };
  }
  return { hasAccess: false };
};
