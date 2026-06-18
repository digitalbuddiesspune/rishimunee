import dayjs from "dayjs";
// Force-load the CommonJS build of astronomy-engine even in ESM context
// to avoid Node trying to parse the ESM bundle via CJS.
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Astronomy = require("astronomy-engine");

const DEG = Astronomy.RAD2DEG;

function normalizeAngle(angle) {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

function estimateLahiriAyanamsha(date) {
  const y = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
  return 23.8531 + 0.013969 * (y - 2000);
}

function eclipticLongitude(body, time) {
  if (body === "Moon") {
    const m = Astronomy.EclipticGeoMoon(time);
    return normalizeAngle(m.lon * DEG);
  }
  const v = Astronomy.GeoVector(Astronomy.Body[body], time, true);
  const e = Astronomy.Ecliptic(v);
  return normalizeAngle(e.elon);
}

function toAstroTimeForLocalMidnight(dateStr, offsetMinutes) {
  const startUT = new Date(Date.parse(`${dateStr}T00:00:00Z`) - offsetMinutes * 60 * 1000);
  return startUT;
}

function getObserver(lat = 28.6139, lon = 77.209, elevation = 0) {
  return new Astronomy.Observer(lat, lon, elevation);
}

function formatLocal(time, offsetMinutes) {
  const ms = time.date.getTime() + offsetMinutes * 60 * 1000;
  const d = new Date(ms);
  const hh = d.getUTCHours();
  const mm = d.getUTCMinutes();
  const h12 = ((hh + 11) % 12) + 1;
  const ampm = hh < 12 ? "AM" : "PM";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h12)}:${pad(mm)} ${ampm}`;
}

function tithiInfo(moonSid, sunSid) {
  const diff = normalizeAngle(moonSid - sunSid);
  const idx = Math.floor(diff / 12); // 0..29
  const number = idx + 1;
  const names = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
  ];
  const phase = number <= 15 ? "Shukla" : "Krishna";
  const name = names[idx];
  return { number, name, phase };
}

function nakshatraFromLongitude(lon) {
  const list = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
    "Revati"
  ];
  const idx = Math.floor(normalizeAngle(lon) / (360 / 27));
  return list[idx];
}

function yogaFromLongitudes(moonSid, sunSid) {
  const sum = normalizeAngle(moonSid + sunSid);
  const idx = Math.floor(sum / (360 / 27));
  const names = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
  ];
  return names[idx];
}

function karanaFromDiff(diff) { // diff: 0..360
  const n = Math.floor(diff / 6); // 0..59 (each karana is 6°)
  const seq = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
  if (n === 0) return "Kimstughna";
  if (n >= 1 && n <= 56) return seq[(n - 1) % 7];
  if (n === 57) return "Shakuni";
  if (n === 58) return "Chatushpada";
  return "Naga"; // n === 59
}

export const getDailyPanchang = (location, date = new Date(), opts = {}) => {
  const { lat = 28.6139, lon = 77.209, elevation = 0, timezoneOffsetMinutes = 330 } = opts;
  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  const startUT = toAstroTimeForLocalMidnight(formattedDate, timezoneOffsetMinutes);
  const observer = getObserver(lat, lon, elevation);

  const riseSun = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startUT, 1);
  const setSun = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startUT, 1);
  const riseMoon = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, startUT, 2);
  const setMoon = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, startUT, 2);

  // Use local noon for longitudes to represent the day's Panchang roughly.
  const noonLocal = new Date(Date.parse(`${formattedDate}T12:00:00Z`) - timezoneOffsetMinutes * 60 * 1000);
  const t = Astronomy.MakeTime(noonLocal);
  const ayan = estimateLahiriAyanamsha(t.date);
  const sun = normalizeAngle(eclipticLongitude("Sun", t) - ayan);
  const moon = normalizeAngle(eclipticLongitude("Moon", t) - ayan);
  const diff = normalizeAngle(moon - sun);

  const tithi = tithiInfo(moon, sun);
  const nakshatra = nakshatraFromLongitude(moon);
  const yoga = yogaFromLongitudes(moon, sun);
  const karana = karanaFromDiff(diff);

  return {
    date: formattedDate,
    tithi: `${tithi.phase} Paksha ${tithi.name}`,
    nakshatra,
    yoga,
    karana,
    sunrise: riseSun ? formatLocal(riseSun, timezoneOffsetMinutes) : null,
    sunset: setSun ? formatLocal(setSun, timezoneOffsetMinutes) : null,
    moonrise: riseMoon ? formatLocal(riseMoon, timezoneOffsetMinutes) : null,
    moonset: setMoon ? formatLocal(setMoon, timezoneOffsetMinutes) : null,
    location,
    notes: "Calculated using astronomy-engine with Lahiri ayanamsha (approx.)."
  };
};
