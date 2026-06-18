import { getDailyPanchang } from "../services/panchangService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const fetchPanchang = asyncHandler(async (req, res) => {
  const { location, lat, lon, elevation, tzOffset } = req.query;
  const opts = {
    lat: lat ? parseFloat(lat) : undefined,
    lon: lon ? parseFloat(lon) : undefined,
    elevation: elevation ? parseFloat(elevation) : undefined,
    timezoneOffsetMinutes: tzOffset ? parseInt(tzOffset, 10) : undefined,
  };
  const panchang = getDailyPanchang(location || "Delhi, India", new Date(), opts);
  return successResponse(res, { panchang });
});
