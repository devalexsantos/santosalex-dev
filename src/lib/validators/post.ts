import { z } from "zod";

const localeVersionSchema = z.object({
  slug: z.string().min(1, "Slug obrigatório"),
  title: z.string().min(1, "Título obrigatório"),
  excerpt: z.string().min(1, "Resumo obrigatório"),
  content: z.string().min(1, "Conteúdo obrigatório"),
  seoTitle: z.string().default(""),
  seoDescription: z.string().default(""),
});

export const postSchema = z.object({
  // General
  translationGroupId: z.string().min(1, "Group ID obrigatório"),
  category: z.enum([
    "architecture",
    "ai",
    "saas",
    "frontend",
    "backend",
    "infra",
    "product",
    "experiment",
    "deploy",
    "performance",
  ]),
  tags: z.string().default(""),    // comma-separated string, split on save
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),  // ISO date string
  readingTime: z.number().int().min(1).nullable().optional(),
  coverImage: z.string().nullable().optional().or(z.literal("")),

  // Per-locale
  "pt-BR": localeVersionSchema,
  en: localeVersionSchema,
});

export type PostFormValues = z.infer<typeof postSchema>;
