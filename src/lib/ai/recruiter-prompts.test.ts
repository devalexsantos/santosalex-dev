import { describe, it, expect } from "vitest";
import {
  RECRUITER_ROLE_IDS,
  ragQueryForRole,
  recruiterSystemPrompt,
  buildContextBlock,
} from "./recruiter-prompts";
import type { RagChunk } from "./rag";

describe("recruiter-prompts", () => {
  it("has 6 canonical role ids", () => {
    expect(RECRUITER_ROLE_IDS).toHaveLength(6);
    expect(new Set(RECRUITER_ROLE_IDS).size).toBe(6);
  });

  it("returns a non-empty query for every canonical role", () => {
    for (const id of RECRUITER_ROLE_IDS) {
      const q = ragQueryForRole(id);
      expect(typeof q).toBe("string");
      expect(q.length).toBeGreaterThan(20);
    }
  });

  it("queries mix Portuguese + English keywords for bilingual recall", () => {
    // Spot-check: at least one keyword in each language should appear
    // across the union of queries (loose check, just a guard against the
    // queries collapsing to a single language by mistake).
    const all = RECRUITER_ROLE_IDS.map(ragQueryForRole).join(" ").toLowerCase();
    expect(all).toMatch(/[a-z]{3,}/); // sanity
    // Common pt-BR-only stem
    expect(all).toMatch(/produto|integra|projeto|decis/);
    // Common en-only stem
    expect(all).toMatch(/product|fullstack|engineer|builder/);
  });

  describe("recruiterSystemPrompt", () => {
    it("embeds the role label in the prompt", () => {
      const prompt = recruiterSystemPrompt({
        roleLabel: "Frontend Developer",
        locale: "pt-BR",
      });
      expect(prompt).toContain("Frontend Developer");
    });

    it("produces a pt-BR prompt that uses Portuguese section headings", () => {
      const prompt = recruiterSystemPrompt({
        roleLabel: "AI Engineer",
        locale: "pt-BR",
      });
      expect(prompt).toContain("Pontos fortes");
      expect(prompt).toContain("Por que considerar o Alex");
    });

    it("produces an en prompt with English section headings", () => {
      const prompt = recruiterSystemPrompt({
        roleLabel: "AI Engineer",
        locale: "en",
      });
      expect(prompt).toContain("Key strengths");
      expect(prompt).toContain("Why consider Alex");
    });

    it("instructs the LLM to use only the provided context", () => {
      const prompt = recruiterSystemPrompt({
        roleLabel: "X",
        locale: "en",
      });
      expect(prompt.toLowerCase()).toContain("only the provided context");
    });
  });

  describe("buildContextBlock", () => {
    it("joins chunks with the same provenance header format as chat", () => {
      const chunks: RagChunk[] = [
        {
          id: "a",
          content: "foo",
          distance: 0.1,
          documentId: "d1",
          documentTitle: "AdvLink",
          sourceType: "project",
          sourceId: "p1",
          locale: "pt-BR",
          metadata: { chunkIndex: 0 },
        },
        {
          id: "b",
          content: "bar",
          distance: 0.2,
          documentId: "d2",
          documentTitle: "Profile",
          sourceType: "profile",
          sourceId: null,
          locale: "pt-BR",
          metadata: { chunkIndex: 2 },
        },
      ];
      const block = buildContextBlock(chunks);
      expect(block).toContain("[AdvLink — chunk 1]");
      expect(block).toContain("foo");
      expect(block).toContain("[Profile — chunk 3]");
      expect(block).toContain("bar");
      // Separator between chunks
      expect(block).toContain("---");
    });

    it("falls back to array index when metadata.chunkIndex is missing", () => {
      const chunks: RagChunk[] = [
        {
          id: "a",
          content: "x",
          distance: 0,
          documentId: "d",
          documentTitle: "Doc",
          sourceType: "project",
          sourceId: "p",
          locale: "en",
          metadata: {},
        },
      ];
      const block = buildContextBlock(chunks);
      expect(block).toContain("chunk 1");
    });
  });
});
