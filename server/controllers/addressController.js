import httpStatus from "http-status";
import { Address } from "../models/Address.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, updatedAt: -1 });
  return successResponse(res, { addresses });
});

export const createAddress = asyncHandler(async (req, res) => {
  const payload = { ...req.body, userId: req.user.id };
  if (payload.isDefault) {
    await Address.updateMany({ userId: req.user.id }, { isDefault: false });
  }
  const address = await Address.create(payload);
  return successResponse(res, { address }, "Address created", httpStatus.CREATED);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  if (payload.isDefault) {
    await Address.updateMany({ userId: req.user.id }, { isDefault: false });
  }
  const address = await Address.findOneAndUpdate({ _id: id, userId: req.user.id }, payload, {
    new: true,
    runValidators: true
  });
  if (!address) {
    throw Object.assign(new Error("Address not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, { address }, "Address updated");
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Address.deleteOne({ _id: id, userId: req.user.id });
  return successResponse(res, {}, "Address deleted", httpStatus.NO_CONTENT);
});

