import httpStatus from "http-status";
import { Order } from "../models/Order.js";
import { Service } from "../models/Service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  PAYMENT_GATEWAYS,
  ORDER_STATUS,
  WALLET_TRANSACTION_STATUS,
  WALLET_TRANSACTION_TYPES
} from "../utils/constants.js";
import { createStripePaymentIntent, createRazorpayOrder, verifyRazorpaySignature, buildPaymentPayload } from "../services/paymentService.js";
import {
  debitWallet,
  markWalletTransactionFailed,
  markWalletTransactionSuccess
} from "../services/walletService.js";
import { User } from "../models/User.js";
import { createPayULaunchUrl, createPayURequest, isPayUConfigured, isPayUMockEnabled, verifyPayUResponse } from "../services/payuService.js";
import { sendOrderNotifications } from "../services/orderNotificationService.js";
import { verifyToken } from "../utils/token.js";
import { WalletTransaction } from "../models/WalletTransaction.js";

const createTransactionId = () => `RM${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
const createInvoiceNumber = (order) => `RM-${new Date().getFullYear()}-${String(order._id).slice(-8).toUpperCase()}`;

export const initiatePayment = asyncHandler(async (req, res) => {
  const { serviceType, gateway = PAYMENT_GATEWAYS.PAYU, platform = "web" } = req.body;
  const service = await Service.findOne({ serviceType });
  if (!service || !service.isActive) {
    throw Object.assign(new Error("Service unavailable"), { statusCode: httpStatus.NOT_FOUND });
  }

  const lineItems = [{ name: service.name, price: service.basePrice, quantity: 1 }];
  const payload = buildPaymentPayload(service, req.user, lineItems);
  if (payload.amount <= 0) {
    throw Object.assign(new Error("Invalid order amount"), { statusCode: httpStatus.BAD_REQUEST });
  }

  const order = await Order.create({
    userId: req.user.id,
    serviceType,
    items: lineItems,
    amount: payload.amount,
    currency: payload.currency,
    paymentGateway: gateway,
    status: ORDER_STATUS.PENDING
  });

  if (gateway === PAYMENT_GATEWAYS.WALLET) {
    const { transaction } = await debitWallet({
      userId: req.user.id,
      amount: payload.amount,
      description: `Wallet payment for ${service.name}`,
      referenceId: order._id.toString(),
      metadata: { serviceType }
    });
    order.status = ORDER_STATUS.PAID;
    order.paymentId = transaction._id.toString();
    order.invoiceNumber = createInvoiceNumber(order);
    order.paidAt = new Date();
    await order.save();
    await sendOrderNotifications(order._id);
    return successResponse(res, { order, walletTransactionId: transaction._id }, "Service activated via wallet");
  }

  let response;
  if (gateway === PAYMENT_GATEWAYS.PAYU) {
    if (!isPayUConfigured() && !isPayUMockEnabled()) {
      throw Object.assign(new Error("PayU is not configured"), { statusCode: httpStatus.SERVICE_UNAVAILABLE });
    }
    const user = await User.findById(req.user.id);
    order.payuTransactionId = createTransactionId();
    await order.save();
    response = {
      ...createPayURequest({ order, user, platform }),
      checkoutUrl: createPayULaunchUrl({ orderId: order._id, platform })
    };
  } else if (gateway === PAYMENT_GATEWAYS.STRIPE) {
    const intent = await createStripePaymentIntent({ amount: payload.amount, currency: payload.currency, metadata: { orderId: order._id.toString(), serviceType } });
    order.paymentId = intent.id;
    await order.save();
    response = { clientSecret: intent.client_secret };
  } else if (gateway === PAYMENT_GATEWAYS.RAZORPAY) {
    const razorpayOrder = await createRazorpayOrder({ amount: payload.amount, currency: payload.currency, receipt: order._id.toString(), notes: { serviceType } });
    order.paymentId = razorpayOrder.id;
    await order.save();
    response = { orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, key: process.env.RAZORPAY_KEY_ID };
  } else {
    response = { instructions: "Integrate Paytm SDK on client", orderId: order._id };
  }

  return successResponse(res, { orderId: order._id, payment: response }, "Payment initiated", httpStatus.CREATED);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, gateway } = req.body;
  const order = await Order.findOne({ _id: orderId, userId: req.user.id });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: httpStatus.NOT_FOUND });
  }

  if (order.paymentGateway === PAYMENT_GATEWAYS.WALLET) {
    return successResponse(res, { order }, "Order completed via wallet");
  }

  if (order.paymentGateway !== gateway) {
    throw Object.assign(new Error("Payment gateway mismatch"), { statusCode: httpStatus.BAD_REQUEST });
  }
  if (gateway !== PAYMENT_GATEWAYS.RAZORPAY) {
    throw Object.assign(new Error("Use the payment provider callback to verify this payment"), {
      statusCode: httpStatus.BAD_REQUEST
    });
  }
  if (gateway === PAYMENT_GATEWAYS.RAZORPAY) {
    const ok = verifyRazorpaySignature({ orderId: order.paymentId, paymentId, signature });
    if (!ok) {
      order.status = ORDER_STATUS.FAILED;
      await order.save();
      throw Object.assign(new Error("Signature verification failed"), { statusCode: httpStatus.BAD_REQUEST });
    }
  }

  order.status = ORDER_STATUS.PAID;
  order.paymentId = paymentId || order.paymentId;
  order.invoiceNumber = order.invoiceNumber || createInvoiceNumber(order);
  order.paidAt = order.paidAt || new Date();
  await order.save();
  await sendOrderNotifications(order._id);

  return successResponse(res, { order }, "Payment verified");
});

const callbackRedirect = (order, platform) => {
  if (platform === "mobile") {
    return `astro://payments/status?orderId=${order._id}`;
  }
  const client = (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0].trim();
  return `${client}/payments/status?orderId=${order._id}`;
};

const walletCallbackRedirect = (transaction, platform) => {
  const status = transaction.status === WALLET_TRANSACTION_STATUS.SUCCESS ? "success" : "failed";
  if (platform === "mobile") {
    return `astro://wallet?topup=${status}`;
  }
  const client = (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0].trim();
  return `${client}/wallet?topup=${status}`;
};

const handleWalletPayUCallback = async (transaction, payload, expectedSuccess, validHash) => {
  const amountMatches = Number(payload.amount).toFixed(2) === Number(transaction.amount).toFixed(2);
  const callbackMetadata = {
    callback: {
      status: payload.status,
      mihpayid: payload.mihpayid,
      error: payload.error,
      receivedAt: new Date()
    }
  };

  if (!validHash || !amountMatches) {
    await markWalletTransactionFailed({
      transactionId: transaction._id,
      metadata: { ...callbackMetadata, reason: validHash ? "amount_mismatch" : "invalid_hash" }
    });
  } else if (expectedSuccess && payload.status === "success") {
    await markWalletTransactionSuccess({
      transactionId: transaction._id,
      referenceId: payload.mihpayid || payload.txnid,
      metadata: callbackMetadata
    });
  } else {
    await markWalletTransactionFailed({
      transactionId: transaction._id,
      metadata: callbackMetadata
    });
  }

  const updated = await WalletTransaction.findById(transaction._id);
  return { transaction: updated, redirect: walletCallbackRedirect(updated, payload.udf2) };
};

const handlePayUCallback = async (req, res, expectedSuccess) => {
  const payload = req.body || {};
  const order = await Order.findOne({
    payuTransactionId: payload.txnid,
    ...(payload.udf1 ? { _id: payload.udf1 } : {})
  });
  const validHash = verifyPayUResponse(payload);
  if (!order) {
    const transaction = await WalletTransaction.findOne({
      _id: payload.udf1,
      gateway: PAYMENT_GATEWAYS.PAYU,
      type: WALLET_TRANSACTION_TYPES.CREDIT,
      "metadata.payuTransactionId": payload.txnid
    });
    if (!transaction) return res.status(404).send("Payment record not found");
    const result = await handleWalletPayUCallback(transaction, payload, expectedSuccess, validHash);
    return res.redirect(result.redirect);
  }

  const amountMatches = Number(payload.amount).toFixed(2) === Number(order.amount).toFixed(2);
  order.paymentCallback = {
    status: payload.status,
    mihpayid: payload.mihpayid,
    error: payload.error,
    receivedAt: new Date()
  };

  if (!validHash || !amountMatches) {
    order.status = ORDER_STATUS.FAILED;
    await order.save();
    return res.redirect(callbackRedirect(order, payload.udf2));
  }

  if (expectedSuccess && payload.status === "success") {
    if (order.status !== ORDER_STATUS.PAID) {
      order.status = ORDER_STATUS.PAID;
      order.paymentId = payload.mihpayid || payload.txnid;
      order.invoiceNumber = order.invoiceNumber || createInvoiceNumber(order);
      order.paidAt = new Date();
      await order.save();
    }
    await sendOrderNotifications(order._id);
  } else if (order.status !== ORDER_STATUS.PAID) {
    order.status = payload.status === "cancelled" ? ORDER_STATUS.CANCELLED : ORDER_STATUS.FAILED;
    await order.save();
  }
  return res.redirect(callbackRedirect(order, payload.udf2));
};

export const payuSuccess = (req, res, next) =>
  handlePayUCallback(req, res, true).catch(next);

export const payuFailure = (req, res, next) =>
  handlePayUCallback(req, res, false).catch(next);

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

export const payuMockCheckout = (req, res) => {
  if (!isPayUMockEnabled()) return res.status(404).send("Not found");
  const fields = req.body || {};
  const hidden = (target, status) => Object.entries({
    ...fields,
    status,
    mock: "true",
    mihpayid: `MOCK-${Date.now()}`
  }).map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`).join("");
  res.send(`<!doctype html><html><head><meta name="viewport" content="width=device-width"><title>PayU Test Checkout</title></head>
  <body style="font-family:Arial,sans-serif;max-width:520px;margin:60px auto;padding:24px">
    <h1>PayU test checkout</h1><p>This is a non-production payment simulation.</p>
    <p><strong>Amount:</strong> ₹${escapeHtml(fields.amount)}</p>
    <form method="post" action="${escapeHtml(fields.surl)}">${hidden(fields.surl, "success")}<button style="padding:12px 18px">Simulate successful payment</button></form>
    <form method="post" action="${escapeHtml(fields.furl)}" style="margin-top:16px">${hidden(fields.furl, "failure")}<button style="padding:12px 18px">Simulate failed payment</button></form>
  </body></html>`);
};

export const payuLaunch = asyncHandler(async (req, res) => {
  let decoded;
  try {
    decoded = verifyToken(req.query.token);
  } catch {
    return res.status(401).send("Checkout link is invalid or expired");
  }
  if (decoded.scope !== "payu_launch") return res.status(401).send("Checkout link is invalid");
  let order;
  let user;
  if (decoded.purpose === "wallet_topup") {
    const transaction = await WalletTransaction.findById(decoded.resourceId || decoded.orderId);
    if (!transaction ||
      transaction.status !== WALLET_TRANSACTION_STATUS.PENDING ||
      transaction.gateway !== PAYMENT_GATEWAYS.PAYU) {
      return res.status(404).send("Checkout is unavailable");
    }
    order = {
      _id: transaction._id,
      amount: transaction.amount,
      items: [{ name: "RisheeMuni wallet recharge" }],
      payuTransactionId: transaction.metadata?.payuTransactionId,
      notes: {}
    };
    user = await User.findById(transaction.userId);
  } else {
    order = await Order.findById(decoded.orderId);
    if (!order || order.status !== ORDER_STATUS.PENDING || order.paymentGateway !== PAYMENT_GATEWAYS.PAYU) {
      return res.status(404).send("Checkout is unavailable");
    }
    user = await User.findById(order.userId);
  }
  const payment = createPayURequest({ order, user, platform: decoded.platform });
  const inputs = Object.entries(payment.fields)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}">`)
    .join("");
  return res.send(`<!doctype html><html><head><meta name="viewport" content="width=device-width"><title>Opening PayU</title></head>
    <body style="font-family:Arial,sans-serif;text-align:center;padding:48px">
      <p>Opening secure checkout...</p>
      <form id="payu" method="post" action="${escapeHtml(payment.actionUrl)}">${inputs}</form>
      <script>document.getElementById("payu").submit()</script>
    </body></html>`);
});

export const listOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === "user" ? { userId: req.user.id } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);
  return successResponse(res, { orders });
});
