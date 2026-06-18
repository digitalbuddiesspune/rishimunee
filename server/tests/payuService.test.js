import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { createPayURequest, verifyPayUResponse } from "../services/payuService.js";

const sha512 = (value) => crypto.createHash("sha512").update(value).digest("hex");

const order = {
  _id: { toString: () => "507f1f77bcf86cd799439011" },
  amount: 499,
  items: [{ name: "Life Report" }],
  payuTransactionId: "RMTX123",
  notes: {}
};
const user = { name: "Aarav Sharma", email: "aarav@example.com", phone: "9999999999" };

test("creates a signed PayU hosted checkout request", () => {
  process.env.PAYU_KEY = "test-key";
  process.env.PAYU_SALT = "test-salt";
  process.env.PAYU_SUCCESS_URL = "https://api.example.com/success";
  process.env.PAYU_FAILURE_URL = "https://api.example.com/failure";
  process.env.PAYU_MOCK_ENABLED = "false";

  const payment = createPayURequest({ order, user, platform: "web" });
  assert.equal(payment.fields.amount, "499.00");
  assert.equal(payment.fields.udf1, order._id.toString());
  assert.equal(payment.fields.udf2, "web");
  assert.equal(payment.fields.hash.length, 128);
});

test("accepts a valid callback hash and rejects a changed amount", () => {
  process.env.PAYU_KEY = "test-key";
  process.env.PAYU_SALT = "test-salt";
  process.env.PAYU_MOCK_ENABLED = "false";

  const payload = {
    key: "test-key",
    txnid: "RMTX123",
    amount: "499.00",
    productinfo: "Life Report",
    firstname: "Aarav",
    email: "aarav@example.com",
    udf1: order._id.toString(),
    udf2: "web",
    status: "success"
  };
  payload.hash = sha512([
    "test-salt",
    payload.status,
    "", "", "", "", "", "", "", "",
    payload.udf2,
    payload.udf1,
    payload.email,
    payload.firstname,
    payload.productinfo,
    payload.amount,
    payload.txnid,
    payload.key
  ].join("|"));

  assert.equal(verifyPayUResponse(payload), true);
  assert.equal(verifyPayUResponse({ ...payload, amount: "1.00" }), false);
});

