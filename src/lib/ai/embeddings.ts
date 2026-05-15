import { aiConfig, getOpenAI } from "./provider";

export async function embed(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: aiConfig.embeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: aiConfig.embeddingModel,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
