import { z } from "zod";

export const ragSearchBodySchema = z.object({
  query: z.string().min(2).max(500),
  locale: z.enum(["pt-BR", "en"]),
  topK: z.number().int().min(1).max(10).default(5),
});

export type RagSearchBody = z.infer<typeof ragSearchBodySchema>;
