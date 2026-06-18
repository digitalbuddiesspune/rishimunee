import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const listReports = asyncHandler(async (req, res) => {
  const filter = req.user.role === "user" ? { userId: req.user.id } : {};
  const reports = await Report.find(filter).sort({ createdAt: -1 });
  return successResponse(res, { reports });
});

export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return successResponse(res, { report: null }, "Report not found");
  }

  const isAdmin = ["admin", "superadmin", "editor"].includes(req.user?.role);
  const isOwner = String(report.userId) === String(req.user?.id);
  if (!isAdmin && !isOwner) {
    const err = new Error("Not authorized to view this report");
    err.statusCode = 403;
    throw err;
  }

  return successResponse(res, { report });
});
