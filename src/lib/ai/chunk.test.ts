import { describe, it, expect } from "vitest";
import { chunkText } from "./chunk";

describe("chunkText", () => {
  it("returns empty array for empty / whitespace-only input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n  ")).toEqual([]);
  });

  it("returns a single chunk when text fits in maxChars", () => {
    const text = "short text".repeat(2);
    const chunks = chunkText(text, { maxChars: 200 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(text);
    expect(chunks[0].metadata.chunkIndex).toBe(0);
    expect(chunks[0].metadata.totalChunks).toBe(1);
  });

  it("splits long text into multiple chunks respecting maxChars", () => {
    const paragraph = "Lorem ipsum dolor sit amet. ".repeat(50);
    const chunks = chunkText(paragraph, { maxChars: 200, overlapChars: 30 });
    expect(chunks.length).toBeGreaterThan(1);
    // Every chunk content length should be <= maxChars + some slack for joining
    for (const c of chunks) {
      expect(c.content.length).toBeLessThanOrEqual(260);
    }
  });

  it("indexes chunks sequentially and records totalChunks", () => {
    const text = "X".repeat(2000);
    const chunks = chunkText(text, { maxChars: 200, overlapChars: 20 });
    chunks.forEach((c, i) => {
      expect(c.metadata.chunkIndex).toBe(i);
      expect(c.metadata.totalChunks).toBe(chunks.length);
    });
  });

  it("prepends the title bracket header when title option is provided", () => {
    const chunks = chunkText("body text", { title: "AdvLink", maxChars: 200 });
    expect(chunks[0].content.startsWith("[AdvLink]\n\n")).toBe(true);
  });

  it("prefers paragraph boundaries over arbitrary cuts", () => {
    // Two paragraphs each just under maxChars — chunker should split between them.
    const p1 = "alpha ".repeat(20).trim();
    const p2 = "beta ".repeat(20).trim();
    const text = `${p1}\n\n${p2}`;
    const chunks = chunkText(text, { maxChars: 130, overlapChars: 0 });
    expect(chunks.length).toBeGreaterThan(1);
    // First chunk should contain "alpha" but not "beta"
    expect(chunks[0].content).toContain("alpha");
    expect(chunks[0].content).not.toContain("beta");
  });
});
