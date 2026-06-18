import httpStatus from "http-status";
import { Order } from "../models/Order.js";
import { ORDER_STATUS } from "../utils/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getOrderById = asyncHandler(async (req, res) => {
  const isAdmin = req.user.scope === "admin";
  const order = await Order.findOne({
    _id: req.params.id,
    ...(isAdmin ? {} : { userId: req.user.id })
  });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, { order });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
  if (!order) {
    throw Object.assign(new Error("Order not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, {
    orderId: order._id,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    invoiceNumber: order.invoiceNumber,
    paymentReference: order.paymentId,
    serviceType: order.serviceType,
    items: order.items,
    createdAt: order.createdAt,
    paidAt: order.paidAt
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, deliveryStatus, notes } = req.body || {};
  const update = {};
  if (status) update.status = status;
  if (deliveryStatus) update.deliveryStatus = deliveryStatus;
  if (notes) update.notes = notes;
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  return successResponse(res, { order }, "Order updated");
});

export const listUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return successResponse(res, { orders });
});

export const consumeEntitlement = asyncHandler(async (req, res) => {
  const { serviceType } = req.body || {};
  if (!serviceType) {
    throw Object.assign(new Error("serviceType required"), { statusCode: httpStatus.BAD_REQUEST });
  }
  const order = await Order.findOne({
    userId: req.user.id,
    serviceType,
    status: ORDER_STATUS.PAID,
    consumed: { $ne: true }
  }).sort({ createdAt: -1 });

  if (!order) {
    throw Object.assign(new Error("Payment required for this service"), { statusCode: httpStatus.PAYMENT_REQUIRED });
  }

  order.consumed = true;
  await order.save();
  return successResponse(res, { order }, "Entitlement consumed");
});
