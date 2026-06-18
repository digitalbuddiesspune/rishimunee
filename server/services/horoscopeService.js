import dayjs from "dayjs";
import { Horoscope } from "../models/Horoscope.js";
import { generateDailyHoroscope } from "./openaiService.js";

export const upsertDailyHoroscope = async ({ zodiacSign, date }) => {
  const isoDate = dayjs(date).startOf("day").toDate();
  const narrative = await generateDailyHoroscope({ zodiacSign, date: isoDate });
  const summary = narrative.split("\n").filter(Boolean);

  const payload = {
    zodiacSign,
    date: isoDate,
    daily: {
      summary: narrative,
      mood: summary[0] || "Balanced",
      love: summary[1] || "Communicate openly",
      finance: summary[2] || "Focus on budgeting",
      health: summary[3] || "Stay hydrated"
    }
  };

  const record = await Horoscope.findOneAndUpdate(
    { zodiacSign, date: isoDate },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return record;
};

export const getHoroscopeBySign = async ({ zodiacSign, date }) => {
  const isoDate = dayjs(date).startOf("day").toDate();
  const existing = await Horoscope.findOne({ zodiacSign, date: isoDate });
  if (existing) return existing;
  return upsertDailyHoroscope({ zodiacSign, date: isoDate });
};

