import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = "Asia/Kolkata";

// Normalize and compute date context for relative date queries
export function getDateContext({ query, timezone: tz } = {}) {
  // Debug: verify execution in runtime
  try { console.log("[dateTool] getDateContext called with:", { query, tz }); } catch (_) {}
  const timezoneName = tz || DEFAULT_TZ;
  const now = dayjs().tz(timezoneName);
  console.log("Im in dateTool")

  // Basic relative parsing for common phrases
  const text = String(query || "").toLowerCase();
  let target = null;

  if (/\btoday\b/.test(text)) {
    target = now;
  } else if (/\btomorrow\b/.test(text)) {
    target = now.add(1, "day");
  } else if (/\byesterday\b/.test(text)) {
    target = now.subtract(1, "day");
  }

  // Attempt to parse explicit date like 2025-09-18 or 18/09/2025 or 18 Sep 2025
  if (!target) {
    const isoMatch = text.match(/(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (isoMatch) {
      const [_, y, m, d] = isoMatch;
      const dt = dayjs.tz(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`, timezoneName);
      if (dt.isValid()) target = dt;
    }
  }

  const formatOut = (d) => ({
    isoDate: d.format("YYYY-MM-DD"),
    human: d.format("dddd, D MMMM YYYY"),
  });

  const current = formatOut(now);
  const today = current;
  const tomorrow = formatOut(now.add(1, "day"));
  const yesterday = formatOut(now.subtract(1, "day"));

  return {
    timezone: timezoneName,
    now: current,
    today,
    tomorrow,
    yesterday,
    targetDate: target ? formatOut(target) : null,
    note: "Use targetDate if present; otherwise map user intent (today/tomorrow/yesterday). All dates are computed in the given timezone.",
  };
}

// OpenAI tool schema for get_date_context
export const getDateContextToolDef = {
  type: "function",
  function: {
    name: "get_date_context",
    description: "Returns current date/time context and computes a target date for queries like today, tomorrow, yesterday, or explicit dates in Asia/Kolkata timezone by default.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user's message to infer if they referred to today, tomorrow, yesterday, or a specific date.",
        },
        timezone: {
          type: "string",
          description: "IANA timezone name. Defaults to Asia/Kolkata.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
};
