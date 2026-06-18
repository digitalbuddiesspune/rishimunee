import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Astronomy = require("astronomy-engine");

const zodiacSigns = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];

const RAD = Astronomy.DEG2RAD;
const DEG = Astronomy.RAD2DEG;

function normalizeAngle(angle) {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

// Very close approximation of Lahiri ayanamsha (deg) with linear drift from J2000.
// Reference: ~23.8531° at J2000, ~0.013969° increase per year.
function estimateLahiriAyanamsha(date) {
  const y = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
  return 23.8531 + 0.013969 * (y - 2000);
}

function signFromLongitude(lon) {
  return zodiacSigns[Math.floor(normalizeAngle(lon) / 30)];
}

function nakshatraFromLongitude(lon) {
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada",
    "Revati"
  ];
  const size = 360 / 27; // 13°20'
  const idx = Math.floor(normalizeAngle(lon) / size);
  return nakshatras[idx];
}

function toAstroTime(date, time, offsetMinutes = 330) {
  const hhmm = time?.length ? time : "00:00";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  const z = `${sign}${oh}:${om}`;
  const iso = `${date}T${hhmm}:00${z}`;
  return Astronomy.MakeTime(new Date(iso));
}

function getObserver(lat = 28.6139, lon = 77.209, elevation = 0) {
  return new Astronomy.Observer(lat, lon, elevation);
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

// Approximate ascendant by scanning the ecliptic for the point
// on the eastern horizon (az ≈ 90°, alt ≈ 0°) at the given time and location.
function computeAscendantLongitude(time, observer) {
  const tilt = Astronomy.e_tilt(time);
  const eps = tilt.tobl * RAD; // true obliquity in radians
  const sinE = Math.sin(eps);
  const cosE = Math.cos(eps);

  function altAzFromEclipticLon(lonDeg) {
    const lam = lonDeg * RAD;
    const sinL = Math.sin(lam), cosL = Math.cos(lam);
    // Convert ecliptic (λ, β=0) to equatorial (α, δ)
    const dec = Math.asin(sinL * sinE); // radians
    const ra = Math.atan2(sinL * cosE, cosL); // radians, 0..2π after normalize
    const raHours = normalizeAngle(ra * DEG) / 15; // hours
    const hor = Astronomy.Horizon(time, observer, raHours, dec * DEG, "normal");
    return hor; // { azimuth, altitude }
  }

  let bestLon = 0;
  let bestScore = Infinity;
  for (let lon = 0; lon < 360; lon += 0.2) {
    const { azimuth, altitude } = altAzFromEclipticLon(lon);
    // penalize distance from east and horizon
    const da = Math.min(Math.abs(azimuth - 90), Math.abs(azimuth - 450));
    const score = Math.abs(altitude) + 10 * da; // azimuth more important
    if (score < bestScore) {
      bestScore = score;
      bestLon = lon;
    }
  }
  // Simple 1-degree local refinement around bestLon
  for (let lon = bestLon - 1; lon <= bestLon + 1; lon += 0.05) {
    const { azimuth, altitude } = altAzFromEclipticLon(lon);
    const da = Math.min(Math.abs(azimuth - 90), Math.abs(azimuth - 450));
    const score = Math.abs(altitude) + 10 * da;
    if (score < bestScore) {
      bestScore = score;
      bestLon = lon;
    }
  }
  return normalizeAngle(bestLon);
}

export const calculateBirthChart = (input) => {
  const offset = Number.isFinite(input?.timezoneOffsetMinutes)
    ? Number(input.timezoneOffsetMinutes)
    : 330; // default IST
  const time = toAstroTime(input.date, input.time, offset);
  const observer = getObserver(input?.lat, input?.lon, input?.elevation || 0);

  // Tropical longitudes
  const longitudes = {
    sun: eclipticLongitude("Sun", time),
    moon: eclipticLongitude("Moon", time),
    mars: eclipticLongitude("Mars", time),
    mercury: eclipticLongitude("Mercury", time),
    jupiter: eclipticLongitude("Jupiter", time),
    venus: eclipticLongitude("Venus", time),
    saturn: eclipticLongitude("Saturn", time)
  };

  // Convert to sidereal (Lahiri) for zodiac/nakshatra/ascendant
  const ayan = estimateLahiriAyanamsha(time.date);
  const sidereal = Object.fromEntries(
    Object.entries(longitudes).map(([k, v]) => [k, normalizeAngle(v - ayan)])
  );

  // Ascendant
  const ascLonTropical = computeAscendantLongitude(time, observer);
  const ascLonSidereal = normalizeAngle(ascLonTropical - ayan);

  const chart = {
    datetime: `${input.date} ${input.time} (UTC${offset >= 0 ? "+" : ""}${(offset/60).toFixed(2)})`,
    location: {
      lat: observer.latitude,
      lon: observer.longitude,
      elevation: observer.height
    },
    zodiacSign: signFromLongitude(sidereal.sun),
    ascendant: signFromLongitude(ascLonSidereal),
    ascendantLongitude: ascLonSidereal,
    nakshatra: nakshatraFromLongitude(sidereal.moon),
    ayanamsha: ayan,
    planetaryLongitudes: {
      system: "sidereal-lahiri",
      degrees: sidereal
    },
    strengths: ["Deterministic planetary math", "AI-powered interpretation"],
    remedies: [],
    rawInput: input
  };
  return chart;
};

export const calculateKundliMatching = (bride, groom) => {
  // Build charts to compare moon sign/nakshatra based scoring.
  const bChart = calculateBirthChart(bride);
  const gChart = calculateBirthChart(groom);

  // Angular distance helper
  const angDist = (a, b) => {
    const d = Math.abs(normalizeAngle(a - b));
    return d > 180 ? 360 - d : d;
  };

  const b = bChart.planetaryLongitudes.degrees;
  const g = gChart.planetaryLongitudes.degrees;

  // 1) Moon harmony (max 18): closer moon longitudes score higher
  const moonScore = Math.max(0, 18 * (1 - angDist(b.moon, g.moon) / 180));

  // 2) Ascendant resonance (max 6)
  const ascB = normalizeAngle(bChart.planetaryLongitudes.degrees.sun + 0); // sun used only for deterministic seed
  const ascG = normalizeAngle(gChart.planetaryLongitudes.degrees.sun + 0);
  const ascScore = Math.max(0, 6 * (1 - angDist(ascB, ascG) / 180));

  // 3) Venus–Mars chemistry (max 6)
  const vmScore = Math.max(0, 6 * (1 - (angDist(b.venus, g.mars) + angDist(g.venus, b.mars)) / 360));

  // 4) Element harmony via Sun signs (max 6)
  const element = (lon) => ["Fire","Earth","Air","Water"][Math.floor((normalizeAngle(lon)/30)%4)];
  const elemScore = element(b.sun) === element(g.sun) ? 6 : 3;

  const total = Math.round((moonScore + ascScore + vmScore + elemScore) * 10) / 10;
  return {
    gunasMatched: Math.min(36, Math.round(total)),
    breakdown: { moonScore: +moonScore.toFixed(1), ascScore: +ascScore.toFixed(1), vmScore: +vmScore.toFixed(1), elemScore },
    compatibilityLevel: total >= 29 ? "Excellent" : total >= 19 ? "Good" : total >= 12 ? "Average" : "Needs Remedies",
    bride: bChart,
    groom: gChart
  };
};

export const evaluateMangalDosha = (chart) => {
  const ascLon = typeof chart?.ascendantLongitude === "number"
    ? chart.ascendantLongitude
    : (chart?.ascendant ? zodiacSigns.indexOf(chart.ascendant) * 30 + 15 : 0);
  const longs = chart?.planetaryLongitudes?.degrees || {};
  const mars = longs.mars ?? 0;
  // Equal-house model from ascendant. Determine Mars house 1..12.
  const house = ((Math.floor(normalizeAngle(mars - ascLon) / 30) + 12) % 12) + 1;
  const mangalHouses = new Set([1, 4, 7, 8, 12]);
  const hasDosha = mangalHouses.has(house);
  const impactLevel = hasDosha ? (house === 1 || house === 8 ? "High" : house === 7 ? "Moderate" : "Mild") : "None";
  const remedies = hasDosha ? [
    "Recite Hanuman Chalisa on Tuesdays",
    "Donate red lentils and jaggery",
    "Perform Mangal Shanti Puja"
  ] : [];
  return { hasDosha, impactLevel, house, remedies, chart };
};

export const evaluateKalSarpDosh = (chart) => {
  const longs = chart?.planetaryLongitudes?.degrees || {};
  const planets = ["sun","moon","mercury","venus","mars","jupiter","saturn"].map(k => longs[k]).filter((v) => typeof v === "number");
  planets.sort((a,b)=>a-b);
  if (planets.length < 2) return { hasDosha: false, type: "insufficient_data", remedies: [], chart };
  // Find minimal arc covering all planets. If <= 180°, flag as Kal Sarp pattern.
  let maxGap = 0;
  for (let i=0;i<planets.length;i++) {
    const a = planets[i];
    const b = planets[(i+1)%planets.length];
    const gap = normalizeAngle((b - a + 360) % 360);
    if (gap > maxGap) maxGap = gap;
  }
  const coveredArc = 360 - maxGap;
  const hasDosha = coveredArc <= 180 + 1e-6; // allow numerical noise
  const type = hasDosha ? (coveredArc < 150 ? "strong" : "moderate") : "none";
  const remedies = hasDosha ? [
    "Rahu-Ketu Shanti Puja",
    "Regular worship of Lord Shiva",
    "Chanting Maha Mrityunjaya Mantra"
  ] : [];
  return { hasDosha, strengthArc: Math.round(coveredArc*10)/10, type, remedies, chart };
};

export const suggestBabyNames = (chart) => {
  // Prefer Nakshatra→Pada syllable based suggestions when lunar longitude is present.
  const moon = chart?.planetaryLongitudes?.degrees?.moon;
  const nak = typeof moon === "number" ? nakshatraFromLongitude(moon) : (chart?.nakshatra || null);
  const pada = typeof moon === "number" ? (Math.floor(((normalizeAngle(moon) % (360/27)) / ((360/27)/4))) + 1) : null;

  const syllables = {
    Ashwini: ["Chu", "Che", "Cho", "La"],
    Bharani: ["Li", "Lu", "Le", "Lo"],
    Krittika: ["A", "I", "U", "E"],
    Rohini: ["O", "Va", "Vi", "Vu"],
    Mrigashira: ["Ve", "Vo", "Ka", "Ki"],
    Ardra: ["Ku", "Gha", "Na", "Cha"],
    Punarvasu: ["Ke", "Ko", "Ha", "Hi"],
    Pushya: ["Hu", "He", "Ho", "Da"],
    Ashlesha: ["Di", "Du", "De", "Do"],
    Magha: ["Ma", "Mi", "Mu", "Me"],
    "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
    "Uttara Phalguni": ["Te", "To", "Pa", "Pe"],
    Hasta: ["Pu", "Sha", "Na", "Tha"],
    Chitra: ["Pe", "Po", "Ra", "Ri"],
    Swati: ["Ru", "Re", "Ro", "Ta"],
    Vishakha: ["Ti", "Tu", "Te", "To"],
    Anuradha: ["Na", "Ne", "Nu", "No"],
    Jyeshtha: ["No", "Ya", "Yi", "Yu"],
    Mula: ["Ye", "Yo", "Ba", "Be"],
    "Purva Ashadha": ["Bu", "Dha", "Bhe", "Da"],
    "Uttara Ashadha": ["Bho", "Ja", "Ji", "Ju"],
    Shravana: ["Ju", "Khi", "Khu", "Khe"],
    Dhanishta: ["Ga", "Gi", "Gu", "Ge"],
    Shatabhisha: ["Go", "Sa", "Si", "Su"],
    "Purva Bhadrapada": ["Se", "So", "Da", "Di"],
    "Uttara Bhadrapada": ["Du", "Tha", "Jha", "Da"],
    Revati: ["De", "Do", "Cha", "Chi"],
  };

  const picks = nak && syllables[nak] ? syllables[nak] : null;
  const seedSyl = picks ? picks[(Math.max(1, Math.min(4, pada || 1)) - 1)] : null;

  // Expanded name index for first-syllable search.
  // Keep small but cover common syllables so we rarely fall back.
  const nameBook = {
    A: ["Aarav", "Aarya", "Aarohi", "Aarush", "Aadhya"],
    I: ["Ira", "Ishan", "Ishita", "Ibrahim", "Inaaya"],
    U: ["Uday", "Urvi", "Utkarsh", "Umang", "Urvashi"],
    E: ["Eesha", "Ekansh", "Ekta", "Eklavya"],
    O: ["Om", "Ojas", "Ovi", "Omkara"],
    Ka: ["Kabir", "Kavya", "Kaira", "Kartik", "Kanishk"],
    Ki: ["Kiaan", "Kiran", "Kiyara", "Kirit"],
    Ku: ["Kunal", "Kuhu", "Kushal", "Kumud"],
    Ke: ["Ketan", "Ketaki", "Keya"],
    Ko: ["Komal", "Koumik", "Kovid"],
    Ga: ["Gaurav", "Gauri", "Gautam", "Gagan"],
    Gi: ["Girish", "Gitanjali", "Gini"],
    Gu: ["Gurpreet", "Gul", "Guneet"],
    Ge: ["Geet", "Geeta", "Gehan"],
    Go: ["Gopal", "Gopika", "Gomti"],
    Cha: ["Charvi", "Charan", "Chahat", "Chandra"],
    Che: ["Chetan", "Chetana", "Chellam"],
    Chi: ["Chirag", "Chinmay", "Chitvan"],
    Cho: ["Chokshi", "Chomana"],
    Chu: ["Chutki"],
    La: ["Lavanya", "Laksh", "Lata", "Laveesh"],
    Li: ["Lina", "Liya", "Likith", "Lisha"],
    Lu: ["Luv", "Luna", "Luthra"],
    Le: ["Leher", "Leela", "Leharsh"],
    Lo: ["Lohit", "Lopamudra", "Lokesh"],
    Ma: ["Mahika", "Mahir", "Madhav", "Manya"],
    Mi: ["Mihir", "Minal", "Mira", "Mitali"],
    Mu: ["Mukul", "Mukta", "Mudit", "Mugdha"],
    Me: ["Meera", "Mehul", "Meghna", "Mehtab"],
    Mo: ["Mohit", "Monika", "Moksh"],
    Na: ["Namrata", "Naveen", "Naman", "Naira"],
    Ne: ["Neel", "Neha", "Neeraj", "Nedha"],
    Ni: ["Nikhil", "Nikita", "Nihar", "Nimrit"],
    No: ["Noor", "Noman"],
    Pu: ["Purvi", "Pushkar", "Punit"],
    Pa: ["Pallavi", "Parth", "Palak", "Pavan"],
    Pe: ["Peeyush", "Peeyali", "Pehar"],
    Po: ["Poonam", "Pooran", "Polomi"],
    Ra: ["Rajat", "Rashi", "Raghav", "Radhika"],
    Ri: ["Ritvik", "Ritu", "Ria", "Riddhima"],
    Ru: ["Rudra", "Ruchi", "Rupak", "Ruhani"],
    Re: ["Reva", "Rehan", "Rekha"],
    Ro: ["Rohan", "Rohini", "Rohit"],
    Sa: ["Sarthak", "Sanya", "Sagar", "Saanvi"],
    Si: ["Siddharth", "Simran", "Sia", "Siddhi"],
    Su: ["Suman", "Suhani", "Suresh", "Sukriti"],
    Se: ["Sejal", "Seher"],
    So: ["Sonal", "Soham", "Somya"],
    Sha: ["Shalini", "Shaurya", "Shaivi", "Shantanu"],
    She: ["Sheetal", "Shekhar"],
    Shi: ["Shikha", "Shiv", "Shivani", "Shishir"],
    Sho: ["Shobha", "Shourya"],
    Sh: ["Shaurya", "Shreya", "Shravan"],
    Ta: ["Tanvi", "Tarun", "Tanya", "Tapan"],
    Ti: ["Tisha", "Tirth", "Titiksha"],
    Tu: ["Tulsi", "Tushar"],
    Te: ["Tejas", "Tejal", "Teerth"],
    To: ["Toshit", "Toral"],
    Tha: ["Thakur", "Tharun"],
    Dha: ["Dhara", "Dhaval", "Dhairya"],
    Bhe: ["Bheem", "Bhela"],
    Bho: ["Bhoomi", "Bhoj"],
    Bu: ["Bulbul", "Bhuvan", "Buddhi"],
    Ba: ["Barkha", "Bala", "Basant"],
    Be: ["Beena", "Bela"],
    Ju: ["Jugal", "Jui", "Juhi"],
    Ja: ["Jagdish", "Jahnvi", "Jatin"],
    Ji: ["Jigyasa", "Jigar"],
    Je: ["Jeevan", "Jestha"],
    Jo: ["Jovita", "Joel"],
    Ya: ["Yash", "Yamini", "Yashika"],
    Yi: ["Yivan"],
    Yu: ["Yuvraj", "Yug", "Yukti"],
    Ye: ["Yesh", "Yedhant"],
    Yo: ["Yogesh", "Yogita"],
    Va: ["Varun", "Vanya", "Vasudha", "Vatsal"],
    Vi: ["Vihan", "Vidhi", "Vibhor", "Vindhya"],
    Vu: ["Vrudhi", "Vrushti", "Vrunal"],
    Ve: ["Ved", "Veda", "Veer", "Vetri"],
    Vo: ["Voras", "Vora"],
  };

  const suggestions = [];
  if (seedSyl) {
    const opts = [seedSyl, seedSyl.slice(0, 2), seedSyl[0]];
    for (const key of opts) {
      if (key && nameBook[key]) {
        suggestions.push(...nameBook[key]);
        break;
      }
    }
  }

  // Fallback to zodiac-based if syllable set lacks coverage
  if (suggestions.length < 6) {
    const seed = chart?.zodiacSign || "Aries";
    const fallback = {
      Aries: ["Aarav", "Aarna", "Advait", "Aarohi"],
      Taurus: ["Bhavya", "Bhavesh", "Bindiya", "Bhoomi"],
      Gemini: ["Charvi", "Chirag", "Chaitanya", "Chiraya"],
      Cancer: ["Daksh", "Divija", "Devansh", "Devyani"],
      Leo: ["Eesha", "Ekansh", "Eklavya", "Elina"],
      Virgo: ["Farhan", "Falguni", "Fateh", "Frida"],
      Libra: ["Gauri", "Gautam", "Girik", "Gunita"],
      Scorpio: ["Harsh", "Harini", "Hemant", "Hridya"],
      Sagittarius: ["Ishan", "Isha", "Ishika", "Indira"],
      Capricorn: ["Jai", "Jahnvi", "Jatin", "Jasleen"],
      Aquarius: ["Kabir", "Kavya", "Kiaan", "Kashvi"],
      Pisces: ["Lakshya", "Lavanya", "Lalit", "Leya"],
    };
    suggestions.push(...(fallback[seed] || ["Ishan", "Ishani", "Ira"]));
  }
  // Trim to 8 unique names
  return Array.from(new Set(suggestions)).slice(0, 8);
};

// Build a month-by-month sidereal planetary position summary for upcoming months
export const calculateGocharTimeline = (input, months = 3) => {
  const offset = Number.isFinite(input?.timezoneOffsetMinutes) ? Number(input.timezoneOffsetMinutes) : 330;
  const observer = getObserver(input?.lat, input?.lon, input?.elevation || 0);
  const startDate = dayjs(`${input.date} ${input.time || "12:00"}`);
  const entries = [];
  for (let m = 0; m < Math.max(1, Math.min(12, months)); m++) {
    const d = startDate.add(m, "month").format("YYYY-MM-DD");
    const iso = new Date(Date.parse(`${d}T12:00:00Z`) - offset * 60 * 1000); // local noon
    const t = Astronomy.MakeTime(iso);
    const ayan = estimateLahiriAyanamsha(t.date);
    const pos = {
      sun: normalizeAngle(eclipticLongitude("Sun", t) - ayan),
      moon: normalizeAngle(eclipticLongitude("Moon", t) - ayan),
      mercury: normalizeAngle(eclipticLongitude("Mercury", t) - ayan),
      venus: normalizeAngle(eclipticLongitude("Venus", t) - ayan),
      mars: normalizeAngle(eclipticLongitude("Mars", t) - ayan),
      jupiter: normalizeAngle(eclipticLongitude("Jupiter", t) - ayan),
      saturn: normalizeAngle(eclipticLongitude("Saturn", t) - ayan),
    };
    const signs = Object.fromEntries(Object.entries(pos).map(([k,v]) => [k, signFromLongitude(v)]));
    entries.push({ date: d, signs, longitudes: pos });
  }
  return { system: "sidereal-lahiri", months, entries, observer };
};
