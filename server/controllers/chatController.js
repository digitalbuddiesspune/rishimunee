import httpStatus from "http-status";
import mongoose from "mongoose";
import { Chat } from "../models/Chat.js";
import { Astrologer } from "../models/Astrologer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  generateAstrologerResponse,
  prepareMessagesWithDateContext,
} from "../services/openaiService.js";
import { getOpenAIClient } from "../config/openai.js";
import {
  checkTimeAccess,
  purchaseTimeAccess,
  ensureActiveTimePass,
  quoteTimeAccess,
} from "../services/chatAccessService.js";

// Ensure consistent newlines across platforms and providers
const normalizeNewlines = (text) =>
  typeof text === "string"
    ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    : text;

const AI_PERSONAS = {
  "ai-arya": {
    name: "AI Guru Arya",
    description: "Empathetic Vedic AI advisor",
    prompts: {
      persona: "You are AI Guru Arya, a compassionate Vedic astrologer.",
      system: "Use clear Hindi-English mix and offer practical remedies.",
    },
  },
  "ai-tara": {
    name: "Tarot Sage Tara",
    description: "Tarot insights for love and finances",
    prompts: {
      persona: "You are Tarot Sage Tara, insightful and warm.",
      system: "Blend tarot intuition with supportive guidance.",
    },
  },
};

const isValidObjectId = (val) =>
  typeof val === "string" && /^[a-f\d]{24}$/i.test(val);

export const startChatSession = asyncHandler(async (req, res) => {
  const { astrologerId, astrologerSlug } = req.body;
  console.log("Astrologer ID: ", astrologerId);

  let astro = null;
  let slug = astrologerSlug;
  let astroIdForChat;

  if (isValidObjectId(astrologerId)) {
    astro = await Astrologer.findById(astrologerId);
    if (!astro) {
      throw Object.assign(new Error("Astrologer not found"), {
        statusCode: httpStatus.NOT_FOUND,
      });
    }
    astroIdForChat = astro._id;
  } else if (slug && AI_PERSONAS[slug]) {
    astroIdForChat = new mongoose.Types.ObjectId();
  } else {
    // fallback to default AI persona
    slug = "ai-arya";
    astroIdForChat = new mongoose.Types.ObjectId();
  }

  // When chatting with a DB astrologer, require explicit confirmation before charging
  if (isValidObjectId(astrologerId)) {
    const status = await checkTimeAccess({ userId: req.user.id, astrologerId });
    if (!status.hasAccess) {
      const err = new Error("Paid feature: confirm to proceed");
      err.statusCode = httpStatus.PAYMENT_REQUIRED;
      err.code = "NEED_CONFIRMATION";
      err.requiredRate = status.rate;
      throw err;
    }
  }

  // Idempotent creation: return existing active session or create one atomically
  const chat = await Chat.findOneAndUpdate(
    { userId: req.user.id, astrologerId, sessionStatus: "active" },
    {
      $setOnInsert: {
        userId: req.user.id,
        astrologerId,
        messages: [],
        serviceType: "ai_chat",
        sessionStatus: "active",
      },
    },
    { new: true, upsert: true }
  );

  return successResponse(
    res,
    { chatId: chat._id },
    "Chat session ready",
    httpStatus.OK
  );
});

export const sendChatMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;
  const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
  if (!chat) {
    throw Object.assign(new Error("Chat session not found"), {
      statusCode: httpStatus.NOT_FOUND,
    });
  }
  // Require active pass; do not auto-charge here
  if (chat.astrologerId) {
    const status = await ensureActiveTimePass({
      userId: req.user.id,
      astrologerId: chat.astrologerId,
    });
    if (!status.hasAccess) {
      const err = new Error("Chat pass required. Confirm purchase.");
      err.statusCode = httpStatus.PAYMENT_REQUIRED;
      err.code = "PASS_REQUIRED";
      throw err;
    }
  }

  chat.messages.push({ sender: "user", text: message });
  let astrologer = await Astrologer.findById(chat.astrologerId);
  if (!astrologer && chat.astrologerSlug && AI_PERSONAS[chat.astrologerSlug]) {
    astrologer = AI_PERSONAS[chat.astrologerSlug];
  }
  const aiReply = await generateAstrologerResponse({
    astrologer,
    conversation: chat.messages,
  });
  const normalized = normalizeNewlines(aiReply);
  chat.messages.push({ sender: "astrologer", text: normalized });
  await chat.save();

  return successResponse(res, { reply: normalized, chat });
});

export const streamChatMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
  if (!chat) {
    throw Object.assign(new Error("Chat session not found"), {
      statusCode: httpStatus.NOT_FOUND,
    });
  }

  // Require active pass; do not auto-charge here
  if (chat.astrologerId) {
    const status = await ensureActiveTimePass({
      userId: req.user.id,
      astrologerId: chat.astrologerId,
    });
    if (!status.hasAccess) {
      const err = new Error("Chat pass required. Confirm purchase.");
      err.statusCode = httpStatus.PAYMENT_REQUIRED;
      err.code = "PASS_REQUIRED";
      throw err;
    }
  }

  // Persist the user message first so history stays consistent
  chat.messages.push({ sender: "user", text: message });
  await chat.save();

  const astrologer = await Astrologer.findById(chat.astrologerId);

  // Prepare SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  try {
    req.socket?.setTimeout(0);
  } catch (_) {}
  try {
    res.flushHeaders && res.flushHeaders();
  } catch (_) {}
  // CORS for SSE over custom origins is already handled by cors() middleware
  // Send a preamble to establish the stream
  res.write(":ok\n\n");

  const client = getOpenAIClient();
  const systemPrompt =
    (astrologer?.prompts?.persona ||
      "You are a compassionate Indian astrologer blending Vedic wisdom with modern clarity.") +
    " " +
    (astrologer?.prompts?.system ||
      "Provide actionable astrological guidance grounded in verified Panchang data when possible.");

  let messages = [
    { role: "system", content: systemPrompt },
    ...chat.messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    })),
  ];

  // Pre-resolve date tool so the streamed answer uses correct date context
  try {
    messages = await prepareMessagesWithDateContext(messages);
  } catch (e) {
    // If tool preflight fails, continue with regular messages
  }

  let fullText = "";
  let closed = false;
  const controller = new AbortController();
  const { signal } = controller;

  const safeWrite = (data) => {
    if (closed) return false;
    try {
      return res.write(data);
    } catch (_) {
      return false;
    }
  };
  const closeStream = () => {
    if (closed) return;
    closed = true;
    try {
      clearInterval(heartbeat);
    } catch (_) {}
    try {
      res.end();
    } catch (_) {}
  };
  req.on("close", () => {
    controller.abort();
    closeStream();
  });
  const heartbeat = setInterval(() => {
    safeWrite(":ping\n\n");
  }, 15000);

  try {
    const stream = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.8,
        max_completion_tokens: 600,
        messages,
        stream: true,
      },
      { signal }
    );

    for await (const chunk of stream) {
      // console.log("chunk", chunk);
      const delta = chunk?.choices?.[0]?.delta?.content || "";
      // console.log("delta", delta);
      if (delta) {
        const normalizedDelta = normalizeNewlines(delta);
        fullText += normalizedDelta;
        // Send SSE data event for each token chunk, preserving newlines per SSE spec
        const lines = String(normalizedDelta).split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (!safeWrite(`data: ${lines[i]}\n`)) {
            controller.abort();
            break;
          }
        }
        safeWrite("\n");
      }
    }

    // Save the assistant's full reply
    if (fullText.trim()) {
      chat.messages.push({ sender: "astrologer", text: fullText });
      await chat.save();
    }

    // Indicate completion
    safeWrite("data: [DONE]\n\n");
    closeStream();
  } catch (err) {
    // Send an error event and end stream
    const msg =
      err?.name === "AbortError"
        ? "Stream aborted"
        : err?.message || "Streaming failed";
    try {
      safeWrite(`event: error\n`);
      safeWrite(`data: ${msg}\n\n`);
    } catch (_) {}
    closeStream();
  }
});

export const fetchChatHistory = asyncHandler(async (req, res) => {
  const { astrologerId, astrologerSlug } = req.query;
  const filter = { userId: req.user.id };
  if (isValidObjectId(astrologerId)) filter.astrologerId = astrologerId;
  if (astrologerSlug) filter.astrologerSlug = astrologerSlug;
  const chats = await Chat.find(filter).sort({ updatedAt: -1 }).limit(20);
  return successResponse(res, { chats });
});

// New: Quote the price and pass status before starting chat (no charge)
export const quoteChatAccess = asyncHandler(async (req, res) => {
  const { astrologerId, minutes } = req.query;
  if (!isValidObjectId(astrologerId)) {
    throw Object.assign(new Error("Valid astrologerId is required"), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }
  const status = await checkTimeAccess({ userId: req.user.id, astrologerId });
  if (status.hasAccess) {
    return successResponse(
      res,
      { hasAccess: true, price: 0, validUntil: status.validUntil },
      "Access active"
    );
  }
  const quote = await quoteTimeAccess({
    astrologerId,
    minutes: Number(minutes),
  });
  return successResponse(
    res,
    {
      hasAccess: false,
      price: quote.price,
      minutes: quote.minutes,
      rate: quote.rate,
    },
    "Access quote ready"
  );
});

// New: Confirm and purchase the daily chat pass (charges wallet if needed)
export const confirmChatAccess = asyncHandler(async (req, res) => {
  const { astrologerId, minutes } = req.body;
  if (!isValidObjectId(astrologerId)) {
    throw Object.assign(new Error("Valid astrologerId is required"), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }
  const result = await purchaseTimeAccess({
    userId: req.user.id,
    astrologerId,
    minutes: Number(minutes),
  });
  return successResponse(
    res,
    {
      hasAccess: result.hasAccess,
      validUntil: result.pass?.validUntil,
      charged: result.charged,
      price: result.pass?.priceCharged || 0,
      minutes: result.pass?.durationMinutes || Number(minutes),
    },
    result.charged ? "Pass purchased" : "Access active"
  );
});
