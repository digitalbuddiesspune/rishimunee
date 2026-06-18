import crypto from "crypto";
import { getStripeClient, getRazorpayClient } from "../config/payment.js";
import { logger } from "../utils/logger.js";

export const createStripePaymentIntent = async ({ amount, currency = "INR", metadata }) => {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true }
  });

  return intent;
};

export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes }) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error("Razorpay is not configured");
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes
  });

  return order;
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    logger.warn("Cannot verify Razorpay signature without secret");
    return false;
  }
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${orderId}|${paymentId}`);
  const digest = hmac.digest("hex");
  return digest === signature;
};

export const buildPaymentPayload = (service, user, items) => {
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  return {
    amount: total,
    currency: service?.currency || "INR",
    description: `${service?.name || "Service"} for ${user.name}`,
    metadata: {
      serviceType: service?.serviceType,
      userId: user._id?.toString()
    }
  };
};

