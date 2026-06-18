import Stripe from "stripe";
import Razorpay from "razorpay";
import { logger } from "../utils/logger.js";
import { PAYMENT_GATEWAYS } from "../utils/constants.js";

let stripeClient;
let razorpayClient;

export const getStripeClient = () => {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    logger.warn("STRIPE_SECRET_KEY not configured; Stripe payments disabled");
    return null;
  }
  stripeClient = new Stripe(key);
  return stripeClient;
};

export const getRazorpayClient = () => {
  if (razorpayClient) return razorpayClient;
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) {
    logger.warn("Razorpay keys not configured; Razorpay payments disabled");
    return null;
  }
  razorpayClient = new Razorpay({ key_id: key, key_secret: secret });
  return razorpayClient;
};

export const isGatewayConfigured = (gateway) => {
  switch (gateway) {
    case PAYMENT_GATEWAYS.STRIPE:
      return Boolean(process.env.STRIPE_SECRET_KEY);
    case PAYMENT_GATEWAYS.RAZORPAY:
      return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    case PAYMENT_GATEWAYS.PAYTM:
      return Boolean(process.env.PAYTM_MERCHANT_ID && process.env.PAYTM_MERCHANT_KEY);
    case PAYMENT_GATEWAYS.PAYU:
      return Boolean(process.env.PAYU_KEY && process.env.PAYU_SALT);
    default:
      return false;
  }
};
