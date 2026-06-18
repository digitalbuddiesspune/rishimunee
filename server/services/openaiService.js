import { getOpenAIClient } from "../config/openai.js";
import { SERVICE_TYPES } from "../utils/constants.js";
import { getDateContext, getDateContextToolDef } from "./tools/dateTool.js";

const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
console.log("Default model", defaultModel)

const normalizeNewlines = (text) =>
  typeof text === "string" ? text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : text;

const buildSystemPrompt = (astrologer) => {
  const persona = astrologer?.prompts?.persona ||
    "You are a compassionate Indian astrologer blending Vedic wisdom with modern clarity.";
  const style = astrologer?.prompts?.system ||
    "Provide actionable astrological guidance grounded in verified Panchang data when possible.";
  const toolGuidance =
    "When asked for a horoscope for a specific day (today, tomorrow, yesterday, or a specific date), first call get_date_context to compute the correct date in the user's timezone before answering.";
  return `${persona} ${style} ${toolGuidance}`;
};

function extractLastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") return String(messages[i].content || "");
  }
  return "";
}

function isDateQuery(text) {
  const t = String(text || "").toLowerCase();
  return /\b(today|todays|tomorrow|yesterday|date|what\s*is\s*the\s*date|which\s*date|day\s*is\s*it)\b/.test(t);
}

// Internal helper: run a tool-calling pass to fetch date context when requested
async function resolveWithDateTool({ messages, temperature = 0.8, maxTokens = 600 }) {
  const client = getOpenAIClient();
  const lastUser = extractLastUserMessage(messages);
  const forceTool = isDateQuery(lastUser);
  const first = await client.chat.completions.create({
    model: defaultModel,
    temperature,
    max_completion_tokens: maxTokens,
    messages,
    tools: [getDateContextToolDef],
    tool_choice: forceTool ? { type: "function", function: { name: "get_date_context" } } : "auto",
  });

  const msg = first.choices?.[0]?.message;
  if (msg?.tool_calls?.length) {
    const toolResponses = [];
    for (const call of msg.tool_calls) {
      if (call.function?.name === "get_date_context") {
        let args = {};
        try { args = JSON.parse(call.function.arguments || "{}"); } catch (_) {}
        const result = getDateContext({ query: args.query ?? lastUser, timezone: args.timezone });
        toolResponses.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
    const second = await client.chat.completions.create({
      model: defaultModel,
      temperature,
      max_completion_tokens: maxTokens,
      messages: [...messages, msg, ...toolResponses],
    });
    const content2 = second.choices?.[0]?.message?.content;
    return normalizeNewlines(content2 || "I am reflecting on your energies; please ask again.");
  }
  const content = msg?.content;
  // Fallback: if we wanted the tool but the model didn't call it, inject a brief date context in system prepended and try again once
  if (forceTool) {
    const ctx = getDateContext({ query: lastUser });
    const second = await client.chat.completions.create({
      model: defaultModel,
      temperature,
      max_completion_tokens: maxTokens,
      messages: [
        { role: "system", content: `Date context: ${JSON.stringify(ctx)}` },
        ...messages,
      ],
    });
    const content3 = second.choices?.[0]?.message?.content;
    return normalizeNewlines(content3 || content || "I am reflecting on your energies; please ask again.");
  }
  return normalizeNewlines(content || "I am reflecting on your energies; please ask again.");
}

export const generateAstrologerResponse = async ({ astrologer, conversation }) => {
  const systemPrompt = buildSystemPrompt(astrologer);
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversation.map((msg) => ({ role: msg.sender === "user" ? "user" : "assistant", content: msg.text }))
  ];
  return await resolveWithDateTool({ messages });
};

export const generateBirthChartInsights = async (payload) => {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: defaultModel,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: "You are an expert Vedic astrologer. Interpret the provided planetary positions into a friendly personalised report."
      },
      {
        role: "user",
        content: `Provide a concise birth chart analysis for: ${JSON.stringify(payload)}`
      }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || "Unable to interpret the chart currently.";
  return normalizeNewlines(content);
};

export const generateCompatibilityInsights = async (payload) => {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: defaultModel,
    temperature: 0.65,
    messages: [
      {
        role: "system",
        content: "You are a trusted Vedic astrologer. Provide a compatibility analysis based on the given partner charts."}
      ,
      {
        role: "user",
        content: `Give kundli matching insights for: ${JSON.stringify(payload)}`
      }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || "Compatibility insights are unavailable right now.";
  return normalizeNewlines(content);
};

export const generateServiceReport = async (serviceType, payload) => {
  const client = getOpenAIClient();
  const prompt = `Generate a ${serviceType} astrology report using the context: ${JSON.stringify(payload)}`;
  const completion = await client.chat.completions.create({
    model: defaultModel,
    temperature: 0.6,
    messages: [
      { role: "system", content: "You are an AI astrologer creating insightful yet practical reports." },
      { role: "user", content: prompt }
    ]
  });
  const content = completion.choices?.[0]?.message?.content || "Report generation failed.";
  return normalizeNewlines(content);
};

export const generateDailyHoroscope = async (payload) => {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: defaultModel,
    temperature: 0.75,
    messages: [
      {
        role: "system",
        content: "You craft culturally rooted yet positive daily horoscope updates for Indian audiences."
      },
      {
        role: "user",
        content: `Prepare horoscope insights for ${payload.zodiacSign} on ${payload.date}`
      }
    ]
  });
  const content = completion.choices?.[0]?.message?.content || "Horoscope not available.";
  return normalizeNewlines(content);
};

export const supportsService = (serviceType) => {
  return Object.values(SERVICE_TYPES).includes(serviceType);
};

// For streaming: pre-resolve date tool and return an augmented messages array
export async function prepareMessagesWithDateContext(messages) {
  const client = getOpenAIClient();
  const lastUser = extractLastUserMessage(messages);
  const forceTool = isDateQuery(lastUser);
  const first = await client.chat.completions.create({
    model: defaultModel,
    temperature: 0.8,
    max_completion_tokens: 1,
    messages,
    tools: [getDateContextToolDef],
    tool_choice: forceTool ? { type: "function", function: { name: "get_date_context" } } : "auto",
  });

  const msg = first.choices?.[0]?.message;
  if (msg?.tool_calls?.length) {
    const toolResponses = [];
    for (const call of msg.tool_calls) {
      if (call.function?.name === "get_date_context") {
        let args = {};
        try { args = JSON.parse(call.function.arguments || "{}"); } catch (_) {}
        const result = getDateContext({ query: args.query ?? lastUser, timezone: args.timezone });
        toolResponses.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
    return [...messages, msg, ...toolResponses];
  }
  // If we intended a tool call but didn't get one, inject context as system message
  if (forceTool) {
    const ctx = getDateContext({ query: lastUser });
    return [{ role: "system", content: `Date context: ${JSON.stringify(ctx)}` }, ...messages];
  }
  return messages;
}
