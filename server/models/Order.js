import mongoose from "mongoose";
import { ORDER_STATUS, SERVICE_TYPES } from "../utils/constants.js";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: {
      type: String,
      enum: Object.values(SERVICE_TYPES),
      required: true
    },
    items: [{
      name: String,
      description: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      metadata: mongoose.Schema.Types.Mixed
    }],
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentGateway: { type: String, default: "razorpay" },
    paymentId: { type: String },
    payuTransactionId: { type: String, index: true, sparse: true },
    invoiceNumber: { type: String, index: true, sparse: true },
    paidAt: { type: Date },
    paymentCallback: mongoose.Schema.Types.Mixed,
    customerEmailSentAt: { type: Date },
    merchantEmailSentAt: { type: Date },
    notificationError: { type: String },
    receiptUrl: { type: String },
    notes: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

// Single-use entitlement flag for services booked via orders
orderSchema.add({ consumed: { type: Boolean, default: false } });

export const Order = mongoose.model("Order", orderSchema);
