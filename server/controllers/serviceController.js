import httpStatus from "http-status";
import { Service } from "../models/Service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const listServices = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = {};
  if (!(String(includeInactive).toLowerCase() === "true")) {
    filter.isActive = true;
  }
  const services = await Service.find(filter).sort({ createdAt: -1 });
  return successResponse(res, { services });
});

export const getServiceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { includeInactive } = req.query;
  const service = await Service.findOne({ slug });
  const allowInactive = String(includeInactive).toLowerCase() === "true";
  if (!service || (!allowInactive && !service.isActive)) {
    throw Object.assign(new Error("Service not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  return successResponse(res, { service });
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  return successResponse(res, { service }, "Service created", httpStatus.CREATED);
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return successResponse(res, { service }, "Service updated");
});

export const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    throw Object.assign(new Error("Service not found"), { statusCode: httpStatus.NOT_FOUND });
  }
  service.isActive = !service.isActive;
  await service.save();
  return successResponse(res, { service }, "Service status updated");
});

// Bulk upsert services by slug
export const upsertServices = asyncHandler(async (req, res) => {
  const { services } = req.body || {};
  if (!Array.isArray(services) || services.length === 0) {
    throw Object.assign(new Error("No services provided"), { statusCode: httpStatus.BAD_REQUEST });
  }

  const ops = services.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: { $set: { ...item } },
      upsert: true
    }
  }));

  await Service.bulkWrite(ops, { ordered: false });
  const updated = await Service.find({ slug: { $in: services.map((s) => s.slug) } });
  return successResponse(res, { services: updated }, "Services upserted");
});
