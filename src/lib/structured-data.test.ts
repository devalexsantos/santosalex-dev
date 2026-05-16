import { describe, it, expect } from "vitest";
import {
  personSchema,
  webSiteSchema,
  softwareApplicationSchema,
  blogPostingSchema,
  jsonLdScriptProps,
} from "./structured-data";

describe("structured-data builders", () => {
  describe("personSchema", () => {
    it("returns a valid Person schema", () => {
      const s = personSchema({
        name: "Alex Santos",
        jobTitle: "Fullstack Developer",
        description: "tagline",
        locale: "pt-BR",
      });
      expect(s["@type"]).toBe("Person");
      expect(s.name).toBe("Alex Santos");
      expect(s.sameAs.length).toBeGreaterThan(0);
    });
  });

  describe("webSiteSchema", () => {
    it("uses the supplied locale for inLanguage", () => {
      const s = webSiteSchema({ name: "Site", locale: "en" });
      expect(s["@type"]).toBe("WebSite");
      expect(s.inLanguage).toBe("en");
    });
  });

  describe("softwareApplicationSchema", () => {
    it("only includes sameAs entries that are real URLs", () => {
      const s = softwareApplicationSchema({
        name: "AdvLink",
        description: "...",
        slug: "advlink",
        locale: "pt-BR",
        category: "saas",
        demoUrl: "https://advlink.com",
        githubUrl: null,
        coverImage: null,
        year: 2024,
      });
      expect(s.sameAs).toEqual(["https://advlink.com"]);
    });

    it("renders datePublished from year only", () => {
      const s = softwareApplicationSchema({
        name: "X",
        description: "x",
        slug: "x",
        locale: "en",
        category: "ai",
        year: 2023,
      });
      expect(s.datePublished).toBe("2023-01-01");
    });
  });

  describe("blogPostingSchema", () => {
    it("converts dates to ISO strings", () => {
      const published = new Date("2025-01-19T12:00:00Z");
      const updated = new Date("2025-02-01T09:30:00Z");
      const s = blogPostingSchema({
        title: "T",
        excerpt: "E",
        slug: "t",
        locale: "pt-BR",
        publishedAt: published,
        updatedAt: updated,
      });
      expect(s.datePublished).toBe(published.toISOString());
      expect(s.dateModified).toBe(updated.toISOString());
    });

    it("leaves dates undefined when input is null", () => {
      const s = blogPostingSchema({
        title: "T",
        excerpt: "E",
        slug: "t",
        locale: "en",
        publishedAt: null,
        updatedAt: null,
      });
      expect(s.datePublished).toBeUndefined();
      expect(s.dateModified).toBeUndefined();
    });
  });

  describe("jsonLdScriptProps", () => {
    it("serializes the schema and strips undefined recursively", () => {
      const props = jsonLdScriptProps({
        a: 1,
        b: undefined,
        nested: { c: undefined, d: "keep" },
        arr: [{ e: undefined, f: 2 }, undefined, "x"],
      });
      expect(props.type).toBe("application/ld+json");
      const parsed = JSON.parse(props.dangerouslySetInnerHTML.__html);
      expect(parsed).toEqual({
        a: 1,
        nested: { d: "keep" },
        arr: [{ f: 2 }, "x"],
      });
    });
  });
});
