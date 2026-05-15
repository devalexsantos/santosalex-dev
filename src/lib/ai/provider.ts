import OpenAI from "openai";

let cached: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env to enable AI features.",
    );
  }
  cached = new OpenAI({ apiKey });
  return cached;
}

export const aiConfig = {
  chatModel: process.env.AI_CHAT_MODEL ?? "gpt-4.1-mini",
  embeddingModel:
    process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  embeddingDimensions: Number(process.env.AI_EMBEDDING_DIMENSIONS ?? 1536),
} as const;
