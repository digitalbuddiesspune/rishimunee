import httpStatus from "http-status";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { resolveCheckoutAddress, toAddressSnapshot } from "../services/addressService.js";
import { PAYMENT_GATEWAYS, ORDER_STATUS, SERVICE_TYPES } from "../utils/constants.js";
import { createStripePaymentIntent, createRazorpayOrder } from "../services/paymentService.js";
import { debitWallet } from "../services/walletService.js";
import { User } from "../models/User.js";
import { createPayULaunchUrl, createPayURequest, isPayUConfigured, isPayUMockEnabled } from "../services/payuService.js";
import { sendOrderNotifications } from "../services/orderNotificationService.js";

const createTransactionId = () => `RM${Date.now()}${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
const createInvoiceNumber = (order) => `RM-${new Date().getFullYear()}-${String(order._id).slice(-8).toUpperCase()}`;

const resolveItemsFromRequest = async (userId, reqBody) => {
  const { items } = reqBody || {};
  if (Array.isArray(items) && items.length) {
    // items: [{ productId, quantity }]
    const productIds = items.map((i) => i.productId).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const lineItems = items
      .map((i) => {
        const p = productMap.get(String(i.productId));
        if (!p) return null;
        const qty = Math.max(1, Number(i.quantity) || 1);
        return {
          name: p.name,
          description: p.description,
          price: p.price,
          quantity: qty,
          metadata: { productId: p._id.toString() }
        };
      })
      .filter(Boolean);
    return lineItems;
  }

  // Fallback to user's cart
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  const lineItems = (cart?.items || []).map((i) => ({
    name: i.productId?.name,
    description: i.productId?.description,
    price: i.productId?.price,
    quantity: i.quantity,
    metadata: { productId: i.productId?._id?.toString() }
  }));
  return lineItems;
};

export const initiateProductCheckout = asyncHandler(async (req, res) => {
  const { gateway = PAYMENT_GATEWAYS.PAYU, addressId, address: rawAddress, platform = "web" } = req.body || {};
  const lineItems = await resolveItemsFromRequest(req.user.id, req.body);
  if (!lineItems.length) {
    throw Object.assign(new Error("No items to checkout"), { statusCode: httpStatus.BAD_REQUEST });
  }
  const amount = lineItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  if (amount <= 0) {
    throw Object.assign(new Error("Invalid amount"), { statusCode: httpStatus.BAD_REQUEST });
  }

  const addressRecord = await resolveCheckoutAddress(req.user.id, { addressId, rawAddress });
  if (!addressRecord) {
    throw Object.assign(new Error("Delivery address is required"), { statusCode: httpStatus.BAD_REQUEST });
  }

  const addressSnapshot = toAddressSnapshot(addressRecord);
  const savedAddressId = addressRecord._id?.toString?.() || addressId || null;

  const order = await Order.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.GEMSTONE,
    items: lineItems,
    amount,
    currency: "INR",
    paymentGateway: gateway,
    status: gateway === PAYMENT_GATEWAYS.COD ? ORDER_STATUS.PENDING : ORDER_STATUS.PENDING,
    notes: { address: addressSnapshot, addressId: savedAddressId }
  });

  if (gateway === PAYMENT_GATEWAYS.COD) {
    // For COD, simply place order in pending state
    // Optionally clear the cart
    await Cart.updateOne({ userId: req.user.id }, { $set: { items: [] } });
    return successResponse(res, { order }, "COD order placed", httpStatus.CREATED);
  }

  if (gateway === PAYMENT_GATEWAYS.WALLET) {
    const { transaction } = await debitWallet({
      userId: req.user.id,
      amount,
      description: `Wallet payment for products`,
      referenceId: order._id.toString(),
      metadata: { type: "product" }
    });
    order.status = ORDER_STATUS.PAID;
    order.paymentId = transaction._id.toString();
    order.invoiceNumber = createInvoiceNumber(order);
    order.paidAt = new Date();
    await order.save();
    await Cart.updateOne({ userId: req.user.id }, { $set: { items: [] } });
    await sendOrderNotifications(order._id);
    return successResponse(res, { order, walletTransactionId: transaction._id }, "Order completed via wallet");
  }

  let payment;
  if (gateway === PAYMENT_GATEWAYS.PAYU) {
    if (!isPayUConfigured() && !isPayUMockEnabled()) {
      throw Object.assign(new Error("PayU is not configured"), { statusCode: httpStatus.SERVICE_UNAVAILABLE });
    }
    const user = await User.findById(req.user.id);
    order.payuTransactionId = createTransactionId();
    await order.save();
    payment = {
      ...createPayURequest({ order, user, platform }),
      checkoutUrl: createPayULaunchUrl({ orderId: order._id, platform })
    };
  } else if (gateway === PAYMENT_GATEWAYS.STRIPE) {
    const intent = await createStripePaymentIntent({ amount, currency: "INR", metadata: { orderId: order._id.toString(), type: "product" } });
    order.paymentId = intent.id;
    await order.save();
    payment = { clientSecret: intent.client_secret };
  } else if (gateway === PAYMENT_GATEWAYS.RAZORPAY) {
    const rzp = await createRazorpayOrder({ amount, currency: "INR", receipt: order._id.toString(), notes: { type: "product" } });
    order.paymentId = rzp.id;
    await order.save();
    payment = { orderId: rzp.id, amount: rzp.amount, currency: rzp.currency, key: process.env.RAZORPAY_KEY_ID };
  } else {
    payment = { instructions: "Integrate payment on client", orderId: order._id };
  }

  return successResponse(res, { orderId: order._id, payment }, "Checkout initiated", httpStatus.CREATED);
});
