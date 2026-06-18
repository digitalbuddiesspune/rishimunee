import httpStatus from "http-status";
import { calculateBirthChart, calculateKundliMatching, evaluateMangalDosha, evaluateKalSarpDosh, suggestBabyNames, calculateGocharTimeline } from "../services/kundliService.js";
import { generateBirthChartInsights, generateCompatibilityInsights, generateServiceReport } from "../services/openaiService.js";
import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { SERVICE_TYPES } from "../utils/constants.js";

export const generateKundli = asyncHandler(async (req, res) => {
  const chart = calculateBirthChart(req.body);
  const narrative = await generateBirthChartInsights(chart);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.KUNDLI,
    payload: req.body,
    result: { chart, narrative },
    status: "completed"
  });
  return successResponse(res, { chart, narrative, reportId: report._id }, "Kundli generated", httpStatus.CREATED);
});

export const matchKundli = asyncHandler(async (req, res) => {
  const { bride, groom } = req.body;
  const compatibility = calculateKundliMatching(bride, groom);
  const narrative = await generateCompatibilityInsights({ bride, groom, compatibility });
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.KUNDLI_MATCHING,
    payload: req.body,
    result: { compatibility, narrative },
    status: "completed"
  });
  return successResponse(res, { compatibility, narrative, reportId: report._id }, "Kundli matching completed");
});

export const getMangalDosha = asyncHandler(async (req, res) => {
  const analysis = evaluateMangalDosha(req.body.chart);
  const narrative = await generateServiceReport(SERVICE_TYPES.MANGAL_DOSHA, { ...req.body, analysis });
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.MANGAL_DOSHA,
    payload: req.body,
    result: { analysis, narrative },
    status: "completed"
  });
  return successResponse(res, { analysis, narrative, reportId: report._id });
});

export const getKalSarpDosh = asyncHandler(async (req, res) => {
  const analysis = evaluateKalSarpDosh(req.body.chart);
  const narrative = await generateServiceReport(SERVICE_TYPES.KAL_SARP_DOSH, { ...req.body, analysis });
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.KAL_SARP_DOSH,
    payload: req.body,
    result: { analysis, narrative },
    status: "completed"
  });
  return successResponse(res, { analysis, narrative, reportId: report._id });
});

export const getBabyNameSuggestions = asyncHandler(async (req, res) => {
  const suggestions = suggestBabyNames(req.body.chart);
  const narrative = await generateServiceReport(SERVICE_TYPES.BABY_NAME, { suggestions, preferences: req.body.preferences });
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.BABY_NAME,
    payload: req.body,
    result: { suggestions, narrative },
    status: "completed"
  });
  return successResponse(res, { suggestions, narrative, reportId: report._id });
});

export const getLalKitab = asyncHandler(async (req, res) => {
  const narrative = await generateServiceReport(SERVICE_TYPES.HOROSCOPE_LAL_KITAB, req.body);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.HOROSCOPE_LAL_KITAB,
    payload: req.body,
    result: { narrative },
    status: "completed"
  });
  return successResponse(res, { narrative, reportId: report._id });
});

export const getGocharPhal = asyncHandler(async (req, res) => {
  const months = Number.isFinite(req.body?.months) ? Math.max(1, Math.min(12, parseInt(req.body.months))) : 3;
  const timeline = calculateGocharTimeline(req.body, months);
  const narrative = await generateServiceReport(SERVICE_TYPES.HOROSCOPE_GOCHAR, { timeline, months, preferences: req.body.preferences });
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.HOROSCOPE_GOCHAR,
    payload: req.body,
    result: { timeline, narrative },
    status: "completed"
  });
  return successResponse(res, { timeline, narrative, reportId: report._id });
});

export const getCareerCounselling = asyncHandler(async (req, res) => {
  // expects { chart, goals }
  const payload = { chart: req.body.chart, goals: req.body.goals };
  const narrative = await generateServiceReport(SERVICE_TYPES.CAREER, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.CAREER,
    payload,
    result: { narrative },
    status: "completed"
  });
  return successResponse(res, { narrative, reportId: report._id });
});

export const getLifeReport = asyncHandler(async (req, res) => {
  // expects { chart, concerns } but accepts { goals|question } aliases
  const concerns = req.body.concerns || req.body.goals || req.body.question || "";
  const payload = { chart: req.body.chart, concerns };
  const narrative = await generateServiceReport(SERVICE_TYPES.LIFE_REPORT, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.LIFE_REPORT,
    payload,
    result: { narrative },
    status: "completed"
  });
  return successResponse(res, { narrative, reportId: report._id });
});

export const getServiceHistory = asyncHandler(async (req, res) => {
  const { serviceType } = req.query;
  const filter = { userId: req.user.id };
  if (serviceType) filter.serviceType = serviceType;
  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(20);
  return successResponse(res, { reports });
});

export const getYearAnalysis = asyncHandler(async (req, res) => {
  // expects { chart, year } where year is a number; defaults to current year
  const now = new Date();
  const year = Number.isFinite(req.body?.year) ? parseInt(req.body.year) : now.getFullYear();
  const payload = { chart: req.body.chart, year, preferences: req.body.preferences };
  const narrative = await generateServiceReport(SERVICE_TYPES.YEAR_ANALYSIS, payload);
  const report = await Report.create({
    userId: req.user.id,
    serviceType: SERVICE_TYPES.YEAR_ANALYSIS,
    payload,
    result: { narrative },
    status: "completed",
  });
  return successResponse(res, { narrative, reportId: report._id });
});
