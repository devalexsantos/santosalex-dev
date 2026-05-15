import { z } from "zod";

export const bilingualField = z.object({
  "pt-BR": z.string().default(""),
  en: z.string().default(""),
});

export const featureSchema = z.object({
  title: bilingualField,
  description: bilingualField,
  order: z.number().int().min(0),
});

export const decisionSchema = z.object({
  title: bilingualField,
  description: bilingualField,
  reason: bilingualField,
  order: z.number().int().min(0),
});

export const translationStatusSchema = z.enum([
  "draft",
  "needs_translation",
  "translated",
  "reviewed",
]);

export const projectSchema = z.object({
  // Translation
  translationStatus: translationStatusSchema.default("draft"),
  /// When true, saving will commit `reviewed` status regardless of other logic.
  markReviewed: z.boolean().default(false),

  // General (locale-agnostic)
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  title: z.string().min(1, "Título obrigatório"),
  shortDescription: z.string().min(1, "Descrição curta obrigatória"),
  category: z.enum(["saas", "ai", "frontend", "fullstack", "automation", "infra", "experiment"]),
  status: z.enum(["draft", "in_progress", "shipped", "archived"]),
  year: z.number().int().min(2000).max(2100).nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  coverImage: z.string().url("URL inválida").nullable().optional().or(z.literal("")),
  demoUrl: z.string().url("URL inválida").nullable().optional().or(z.literal("")),
  githubUrl: z.string().url("URL inválida").nullable().optional().or(z.literal("")),

  // Bilingual content
  content: z
    .object({
      "pt-BR": z.object({
        problem: z.string().default(""),
        hypothesis: z.string().default(""),
        targetAudience: z.string().default(""),
        technicalDecisions: z.string().default(""),
        learnings: z.string().default(""),
        nextSteps: z.string().default(""),
        fullDescription: z.string().default(""),
      }),
      en: z.object({
        problem: z.string().default(""),
        hypothesis: z.string().default(""),
        targetAudience: z.string().default(""),
        technicalDecisions: z.string().default(""),
        learnings: z.string().default(""),
        nextSteps: z.string().default(""),
        fullDescription: z.string().default(""),
      }),
    })
    .default({
      "pt-BR": { problem: "", hypothesis: "", targetAudience: "", technicalDecisions: "", learnings: "", nextSteps: "", fullDescription: "" },
      en: { problem: "", hypothesis: "", targetAudience: "", technicalDecisions: "", learnings: "", nextSteps: "", fullDescription: "" },
    }),

  // Dedicated architecture and challenges bilingual fields
  architecture: bilingualField,
  challenges: bilingualField,

  // Stack
  techSlugs: z.array(z.string()).default([]),

  // Features
  features: z.array(featureSchema).default([]),

  // Decisions
  decisions: z.array(decisionSchema).default([]),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
