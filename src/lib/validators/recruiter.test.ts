import { describe, it, expect } from "vitest";
import { recruiterSummaryBodySchema } from "./recruiter";

describe("recruiterSummaryBodySchema", () => {
  it("accepts the 6 canonical role ids in both locales", () => {
    const valid: Array<{ roleId: string; locale: "pt-BR" | "en" }> = [
      { roleId: "frontend-developer", locale: "pt-BR" },
      { roleId: "fullstack-developer", locale: "en" },
      { roleId: "product-engineer", locale: "pt-BR" },
      { roleId: "ai-engineer", locale: "en" },
      { roleId: "saas-builder", locale: "pt-BR" },
      { roleId: "startup-developer", locale: "en" },
    ];
    for (const v of valid) {
      expect(recruiterSummaryBodySchema.safeParse(v).success).toBe(true);
    }
  });

  it("rejects unknown role ids", () => {
    const r = recruiterSummaryBodySchema.safeParse({
      roleId: "wizard-developer",
      locale: "pt-BR",
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown locales", () => {
    const r = recruiterSummaryBodySchema.safeParse({
      roleId: "frontend-developer",
      locale: "fr-FR",
    });
    expect(r.success).toBe(false);
  });

  it("requires both roleId and locale", () => {
    expect(recruiterSummaryBodySchema.safeParse({ roleId: "frontend-developer" }).success).toBe(false);
    expect(recruiterSummaryBodySchema.safeParse({ locale: "pt-BR" }).success).toBe(false);
  });
});
