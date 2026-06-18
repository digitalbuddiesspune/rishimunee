import OpenAI from "openai";

let openaiClient;

export const getOpenAIClient = () => {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Please set it in environment variables.");
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
};

