import { apiClient } from "./client";

export type HoroscopeRecord = {
  _id: string;
  zodiacSign: string;
  date: string;
  daily: {
    summary: string;
    mood?: string;
    love?: string;
    finance?: string;
    health?: string;
  };
};

export async function fetchHoroscope(zodiacSign: string, date?: string) {
  const res = await apiClient.get("/horoscope", { params: { zodiacSign, date } });
  const data = res.data?.data || res.data;
  return data?.horoscope as HoroscopeRecord;
}

