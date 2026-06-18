import crypto from "crypto";
import { signToken } from "../utils/token.js";

const sha512 = (value) => crypto.createHash("sha512").update(value).digest("hex");
const amountString = (amount) => Number(amount).toFixed(2);

export const isPayUConfigured = () => Boolean(process.env.PAYU_KEY && process.env.PAYU_SALT);

export const isPayUMockEnabled = () =>
  process.env.NODE_ENV !== "production" && process.env.PAYU_MOCK_ENABLED === "true";

export const createPayULaunchUrl = ({ orderId, resourceId = orderId, platform, purpose = "order" }) => {
  const token = signToken({
    orderId: String(resourceId),
    resourceId: String(resourceId),
    platform,
    purpose,
    scope: "payu_launch"
  }, { expiresIn: "10m" });
  const base = process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 8000}`;
  return `${base}/api/payments/payu/launch?token=${encodeURIComponent(token)}`;
};

export const createPayURequest = ({ order, user, platform = "web" }) => {
  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;
  const amount = amountString(order.amount);
  const productinfo = order.items.map((item) => item.name).filter(Boolean).join(", ").slice(0, 100) || "RisheeMuni order";
  const firstname = String(user.name || "Customer").trim().split(/\s+/)[0];
  const email = user.email;
  const phone = order.notes?.address?.phone || user.phone || "9999999999";
  const fields = {
    key,
    txnid: order.payuTransactionId,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl: process.env.PAYU_SUCCESS_URL,
    furl: process.env.PAYU_FAILURE_URL,
    udf1: order._id.toString(),
    udf2: platform
  };
  const hashSequence = [
    key,
    fields.txnid,
    amount,
    productinfo,
    firstname,
    email,
    fields.udf1,
    fields.udf2,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    salt
  ].join("|");
  fields.hash = sha512(hashSequence);
  return {
    actionUrl: isPayUMockEnabled()
      ? `${process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 8000}`}/api/payments/payu/mock`
      : process.env.PAYU_BASE_URL || "https://test.payu.in/_payment",
    method: "POST",
    fields,
    mock: isPayUMockEnabled()
  };
};

export const verifyPayUResponse = (payload) => {
  if (isPayUMockEnabled() && payload.mock === "true") return true;
  if (!isPayUConfigured()) return false;
  const salt = process.env.PAYU_SALT;
  const sequence = [
    salt,
    payload.status || "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    payload.udf2 || "",
    payload.udf1 || "",
    payload.email || "",
    payload.firstname || "",
    payload.productinfo || "",
    payload.amount || "",
    payload.txnid || "",
    payload.key || ""
  ].join("|");
  const expected = sha512(payload.additionalCharges ? `${payload.additionalCharges}|${sequence}` : sequence);
  const received = String(payload.hash || "");
  return expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};
