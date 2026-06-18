import httpStatus from "http-status";
import { Astrologer } from "../models/Astrologer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const createAstrologer = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.create(req.body);
  return successResponse(res, { astrologer }, "Astrologer created", httpStatus.CREATED);
});

export const listAstrologers = asyncHandler(async (req, res) => {
  const { type, specialty } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (specialty) filter.specialty = specialty;
  // By default, hide entries where isHidden === true unless explicitly requested
  filter.isHidden = { $ne: true };
  const astrologers = await Astrologer.find(filter).sort({ isFeatured: -1, createdAt: -1 });
  return successResponse(res, { astrologers });
});

export const getAstrologerById = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findById(req.params.id);
  if (!astrologer || astrologer.isHidden) {
    throw Object.assign(new Error("Astrologer not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, { astrologer });
});

export const updateAstrologer = asyncHandler(async (req, res) => {
  const astrologer = await Astrologer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return successResponse(res, { astrologer }, "Astrologer updated");
});

export const deleteAstrologer = asyncHandler(async (req, res) => {
  await Astrologer.findByIdAndDelete(req.params.id);
  return successResponse(res, {}, "Astrologer deleted", httpStatus.NO_CONTENT);
});
