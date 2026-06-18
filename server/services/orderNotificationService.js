import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { sendEmail } from "./emailService.js";
import { logger } from "../utils/logger.js";

const money = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const invoiceHtml = ({ order, user, heading }) => {
  const rows = order.items.map((item) =>
    `<tr><td style="padding:6px">${item.name || "Item"}</td><td style="padding:6px">${item.quantity || 1}</td><td style="padding:6px">${money((item.price || 0) * (item.quantity || 1))}</td></tr>`
  ).join("");
  const address = order.notes?.address;
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
      <h2>${heading}</h2>
      <p><strong>Invoice:</strong> ${order.invoiceNumber}</p>
      <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
      <p><strong>Payment reference:</strong> ${order.paymentId || order.payuTransactionId}</p>
      <p><strong>Payment date:</strong> ${new Date(order.paidAt || order.updatedAt).toLocaleString("en-IN")}</p>
      ${address ? `<p><strong>Delivery address:</strong> ${[address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ")}</p>` : ""}
      <table style="border-collapse:collapse;width:100%"><thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:18px"><strong>Total: ${money(order.amount)}</strong></p>
    </div>
  `;
};

export const sendOrderNotifications = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order || order.status !== "paid") return;
  const user = await User.findById(order.userId);
  if (!user) return;

  const customerClaim = await Order.findOneAndUpdate(
    { _id: orderId, status: "paid", customerEmailSentAt: null },
    { $set: { customerEmailSentAt: new Date() } },
    { new: true }
  );
  if (customerClaim) {
    try {
      await sendEmail({
        to: user.email,
        subject: `Payment confirmed - ${order.invoiceNumber}`,
        html: invoiceHtml({ order, user, heading: "Your payment is confirmed" })
      });
      await Order.updateOne({ _id: orderId }, { $unset: { notificationError: 1 } });
    } catch (error) {
      await Order.updateOne(
        { _id: orderId },
        { $set: { notificationError: error.message }, $unset: { customerEmailSentAt: 1 } }
      );
      logger.error("Customer confirmation email failed", { orderId, error: error.message });
    }
  }

  const merchantClaim = process.env.MERCHANT_INVOICE_EMAIL
    ? await Order.findOneAndUpdate(
      { _id: orderId, status: "paid", merchantEmailSentAt: null },
      { $set: { merchantEmailSentAt: new Date() } },
      { new: true }
    )
    : null;
  if (merchantClaim) {
    try {
      await sendEmail({
        to: process.env.MERCHANT_INVOICE_EMAIL,
        subject: `New paid order - ${order.invoiceNumber}`,
        html: invoiceHtml({ order, user, heading: "New paid order" })
      });
      await Order.updateOne({ _id: orderId }, { $unset: { notificationError: 1 } });
    } catch (error) {
      await Order.updateOne(
        { _id: orderId },
        { $set: { notificationError: error.message }, $unset: { merchantEmailSentAt: 1 } }
      );
      logger.error("Merchant invoice email failed", { orderId, error: error.message });
    }
  }
};
