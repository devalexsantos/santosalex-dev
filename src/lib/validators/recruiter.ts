import { z } from "zod";
import { RECRUITER_ROLE_IDS } from "@/lib/ai/recruiter-prompts";

export const recruiterSummaryBodySchema = z.object({
  roleId: z.enum(RECRUITER_ROLE_IDS as readonly [string, ...string[]]),
  locale: z.enum(["pt-BR", "en"]),
});

export type RecruiterSummaryBody = z.infer<typeof recruiterSummaryBodySchema>;
