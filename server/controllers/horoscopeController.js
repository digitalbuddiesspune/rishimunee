import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getHoroscopeBySign, upsertDailyHoroscope } from "../services/horoscopeService.js";

export const fetchHoroscope = asyncHandler(async (req, res) => {
  const { zodiacSign, date } = req.query;
  const record = await getHoroscopeBySign({ zodiacSign, date: date || new Date() });
  return successResponse(res, { horoscope: record });
});

export const updateHoroscope = asyncHandler(async (req, res) => {
  const { zodiacSign, date } = req.body;
  const record = await upsertDailyHoroscope({ zodiacSign, date: date || new Date() });
  return successResponse(res, { horoscope: record }, "Horoscope updated");
});

