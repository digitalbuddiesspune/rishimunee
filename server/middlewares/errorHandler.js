import httpStatus from "http-status";
import { logger } from "../utils/logger.js";

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";
  logger.error(message, { stack: err.stack });
  const details = err.details || {
    code: err.code,
    requiredAmount: err.requiredAmount,
    referenceId: err.referenceId
  };
  res.status(status).json({ success: false, message, details });
};
