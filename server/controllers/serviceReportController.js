import httpStatus from "http-status";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { generateServiceReport } from "../services/openaiService.js";
import { SERVICE_TYPES } from "../utils/constants.js";
import { Report } from "../models/Report.js";

export const generateCareerReport = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const narrative = await generateServiceReport(SERVICE_TYPES.CAREER, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.CAREER,
    payload,
    result: { narrative },
    status: "completed",
  });
  return successResponse(
    res,
    { narrative, reportId: report._id },
    "Career report generated",
    httpStatus.CREATED
  );
});

export const generateLifeReport = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const narrative = await generateServiceReport(SERVICE_TYPES.LIFE_REPORT, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.LIFE_REPORT,
    payload,
    result: { narrative },
    status: "completed",
  });
  return successResponse(
    res,
    { narrative, reportId: report._id },
    "Life report generated",
    httpStatus.CREATED
  );
});

export const generateYearAnalysis = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const narrative = await generateServiceReport(SERVICE_TYPES.YEAR_ANALYSIS, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.YEAR_ANALYSIS,
    payload,
    result: { narrative },
    status: "completed",
  });
  return successResponse(
    res,
    { narrative, reportId: report._id },
    "Year analysis generated",
    httpStatus.CREATED
  );
});

