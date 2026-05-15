export type Chunk = {
  content: string;
  metadata: Record<string, unknown>;
};

export type ChunkOptions = {
  maxTokens?: number;
  overlapTokens?: number;
};

/**
 * Splits content into chunks suitable for embedding.
 * Real tokenizer-aware implementation lands in Phase 5.
 */
export function chunkText(
  _text: string,
  _options: ChunkOptions = {},
): Chunk[] {
  throw new Error("chunkText: not implemented yet (Phase 5)");
}
