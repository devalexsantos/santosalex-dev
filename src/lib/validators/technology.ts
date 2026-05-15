import { z } from "zod";

export const technologySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  name: z.string().min(1, "Nome obrigatório"),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "ai",
    "devops",
    "infra",
    "automation",
    "payments",
    "email",
    "testing",
    "other",
  ]),
  experienceLevel: z
    .enum(["learning", "intermediate", "advanced", "expert"])
    .default("intermediate"),
  icon: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type TechnologyFormValues = z.infer<typeof technologySchema>;
