import { describe, it, expect } from "vitest";
import { profileFormSchema, bilingualString } from "./profile";

describe("profile validators", () => {
  describe("bilingualString", () => {
    it("accepts both locale keys filled", () => {
      const r = bilingualString.safeParse({ "pt-BR": "olá", en: "hi" });
      expect(r.success).toBe(true);
    });

    it("defaults missing locales to empty string instead of failing", () => {
      const r = bilingualString.safeParse({});
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data["pt-BR"]).toBe("");
        expect(r.data.en).toBe("");
      }
    });
  });

  describe("profileFormSchema", () => {
    it("accepts a minimal payload with empty arrays", () => {
      const r = profileFormSchema.safeParse({
        tagline: { "pt-BR": "tag", en: "tag" },
        bio: { "pt-BR": "bio", en: "bio" },
        approach: { "pt-BR": "ap", en: "ap" },
      });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.roles).toEqual([]);
        expect(r.data.experiences).toEqual([]);
        expect(r.data.faqs).toEqual([]);
      }
    });

    it("validates nested role / experience / faq shape", () => {
      const r = profileFormSchema.safeParse({
        tagline: { "pt-BR": "", en: "" },
        bio: { "pt-BR": "", en: "" },
        approach: { "pt-BR": "", en: "" },
        roles: [
          { title: { "pt-BR": "Fullstack", en: "Fullstack" }, description: { "pt-BR": "x", en: "x" } },
        ],
        experiences: [
          {
            company: "Acme",
            role: { "pt-BR": "Dev", en: "Dev" },
            period: "2023 — atual",
            highlights: { "pt-BR": "y", en: "y" },
          },
        ],
        faqs: [
          { question: { "pt-BR": "q?", en: "q?" }, answer: { "pt-BR": "a", en: "a" } },
        ],
      });
      expect(r.success).toBe(true);
    });

    it("rejects negative order values", () => {
      const r = profileFormSchema.safeParse({
        tagline: { "pt-BR": "", en: "" },
        bio: { "pt-BR": "", en: "" },
        approach: { "pt-BR": "", en: "" },
        roles: [
          {
            title: { "pt-BR": "T", en: "T" },
            description: { "pt-BR": "D", en: "D" },
            order: -1,
          },
        ],
      });
      expect(r.success).toBe(false);
    });

    it("accepts null/missing location and availability", () => {
      const r = profileFormSchema.safeParse({
        tagline: { "pt-BR": "", en: "" },
        bio: { "pt-BR": "", en: "" },
        approach: { "pt-BR": "", en: "" },
        location: null,
        availability: null,
      });
      expect(r.success).toBe(true);
    });
  });
});
