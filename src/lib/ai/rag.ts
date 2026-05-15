export type RagSearchOptions = {
  query: string;
  locale: "pt-BR" | "en";
  topK?: number;
  threshold?: number;
};

export type RagChunk = {
  id: string;
  content: string;
  score: number;
  documentId: string;
  metadata: Record<string, unknown>;
};

/**
 * Searches similar chunks in the pgvector index.
 * Implementation lands in Phase 5.
 */
export async function searchSimilarChunks(
  _options: RagSearchOptions,
): Promise<RagChunk[]> {
  throw new Error("searchSimilarChunks: not implemented yet (Phase 5)");
}
