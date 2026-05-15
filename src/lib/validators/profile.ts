import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const bilingualString = z.object({
  "pt-BR": z.string().default(""),
  en: z.string().default(""),
});

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const profileRoleSchema = z.object({
  id: z.string().optional(),
  title: bilingualString,
  description: bilingualString,
  order: z.number().int().min(0).default(0),
});

export const profileExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().default(""),
  role: bilingualString,
  period: z.string().default(""),
  highlights: bilingualString,
  order: z.number().int().min(0).default(0),
});

export const profileFaqSchema = z.object({
  id: z.string().optional(),
  question: bilingualString,
  answer: bilingualString,
  order: z.number().int().min(0).default(0),
});

// ---------------------------------------------------------------------------
// Main form schema
// ---------------------------------------------------------------------------

export const profileFormSchema = z.object({
  tagline: bilingualString,
  bio: bilingualString,
  approach: bilingualString,
  location: z.string().nullable().optional(),
  availability: z.string().nullable().optional(),
  roles: z.array(profileRoleSchema).default([]),
  experiences: z.array(profileExperienceSchema).default([]),
  faqs: z.array(profileFaqSchema).default([]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
