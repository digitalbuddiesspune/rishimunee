import httpStatus from "http-status";
import { Astrologer } from "../models/Astrologer.js";
import { successResponse } from "../utils/apiResponse.js";
import { checkTimeAccess, ensureActiveTimePass } from "../services/chatAccessService.js";

const buildInstructions = (astrologer) => {
  const persona = astrologer?.prompts?.persona ||
    "You are a compassionate Indian astrologer blending Vedic wisdom with modern clarity.";
  const style = astrologer?.prompts?.system ||
    "Provide actionable astrological guidance grounded in verified Panchang data when possible.";
  const toolGuidance =
    "Speak clearly and naturally. You may respond in Hinglish (Hindi + English) where appropriate for Indian audiences.";
  return `${persona} ${style} ${toolGuidance}`;
};

export const createRealtimeSession = async (req, res, next) => {
  try {
    const { astrologerId } = req.body || {};
    let astrologer = null;

    if (astrologerId) {
      astrologer = await Astrologer.findById(astrologerId);
      if (!astrologer) {
        const err = new Error("Astrologer not found");
        err.statusCode = httpStatus.NOT_FOUND;
        throw err;
      }
      // Require active time-based pass for DB astrologers
      const status = await ensureActiveTimePass({ userId: req.user.id, astrologerId });
      if (!status.hasAccess) {
        const err = new Error("Chat pass required. Confirm purchase.");
        err.statusCode = httpStatus.PAYMENT_REQUIRED;
        err.code = "PASS_REQUIRED";
        throw err;
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const err = new Error("OPENAI_API_KEY missing on server");
      err.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw err;
    }

    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2";
    const voice = process.env.OPENAI_REALTIME_VOICE || "marin";
    const instructions = buildInstructions(astrologer);

    const resp = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions,
          audio: {
            output: {
              voice
            }
          }
        }
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      const err = new Error(`Failed to create realtime session: ${resp.status} ${text}`);
      err.statusCode = httpStatus.BAD_GATEWAY;
      throw err;
    }

    const data = await resp.json();
    const clientSecret = data?.value || data?.client_secret?.value;
    const expiresAt = data?.expires_at || data?.client_secret?.expires_at;

    if (!clientSecret) {
      const err = new Error("Realtime client secret missing in OpenAI response");
      err.statusCode = httpStatus.BAD_GATEWAY;
      throw err;
    }

    return successResponse(res, {
      client_secret: clientSecret,
      model: data?.session?.model || data?.model || model,
      voice,
      expires_at: expiresAt
    }, "Realtime session created");
  } catch (error) {
    next(error);
  }
};
