import httpStatus from "http-status";
import mongoose from "mongoose";
import { Address } from "../models/Address.js";

export const toAddressSnapshot = (doc) => {
  if (!doc) return null;
  const source = doc.toObject ? doc.toObject() : doc;
  return {
    name: source.name,
    phone: source.phone,
    line1: source.line1,
    line2: source.line2 || "",
    city: source.city,
    state: source.state,
    postalCode: source.postalCode,
    country: source.country || "IN"
  };
};

const toAddressPayload = (rawAddress = {}) => ({
  name: rawAddress.name?.trim(),
  phone: rawAddress.phone?.trim(),
  line1: rawAddress.line1?.trim(),
  line2: rawAddress.line2?.trim() || "",
  city: rawAddress.city?.trim(),
  state: rawAddress.state?.trim(),
  postalCode: rawAddress.postalCode?.trim(),
  country: rawAddress.country?.trim() || "IN"
});

const validateAddressPayload = (payload) => {
  if (!payload.name || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.postalCode) {
    throw Object.assign(new Error("Complete delivery address is required"), {
      statusCode: httpStatus.BAD_REQUEST
    });
  }
};

export const saveUserAddress = async (userId, rawAddress, { isDefault = true } = {}) => {
  const payload = toAddressPayload(rawAddress);
  validateAddressPayload(payload);

  const existing = await Address.findOne({
    userId,
    line1: payload.line1,
    postalCode: payload.postalCode,
    city: payload.city
  });

  if (existing) {
    Object.assign(existing, payload);
    if (isDefault) {
      existing.isDefault = true;
      await Address.updateMany({ userId, _id: { $ne: existing._id } }, { isDefault: false });
    }
    await existing.save();
    return existing;
  }

  if (isDefault) {
    await Address.updateMany({ userId }, { isDefault: false });
  }

  const addressCount = await Address.countDocuments({ userId });
  return Address.create({
    ...payload,
    userId,
    isDefault: isDefault || addressCount === 0
  });
};

export const resolveCheckoutAddress = async (userId, { addressId, rawAddress, saveAddress = true }) => {
  if (addressId && mongoose.isValidObjectId(addressId)) {
    const saved = await Address.findOne({ _id: addressId, userId });
    if (saved) return saved;
  }

  if (!rawAddress) return null;

  if (!saveAddress) {
    const payload = toAddressPayload(rawAddress);
    validateAddressPayload(payload);
    return payload;
  }

  return saveUserAddress(userId, rawAddress, { isDefault: true });
};
