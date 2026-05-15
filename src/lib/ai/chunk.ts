/**
 * Text chunker for RAG indexing.
 *
 * Design choice: char-counting over tiktoken.
 * Rationale: tiktoken adds ~3 MB WASM and has edge-runtime constraints.
 * OpenAI text-embedding-3-small averages ~4 chars/token, so 800 chars ≈ 200
 * tokens — well within the 8191-token context limit. Overlap of 150 chars
 * preserves enough bridging context for adjacent chunks.
 */

export type Chunk = {
  content: string;
  metadata: Record<string, unknown>;
};

export type ChunkOptions = {
  /** Target chunk size in characters. Default: 800 */
  maxChars?: number;
  /** Overlap in characters between consecutive chunks. Default: 150 */
  overlapChars?: number;
  /** Document title to prepend to each chunk for isolated-chunk clarity. */
  title?: string;
};

// Legacy alias for callers using the old option names
export type ChunkOptionsLegacy = {
  maxTokens?: number;
  overlapTokens?: number;
};

/**
 * Splits `text` into overlapping chunks suitable for embedding.
 *
 * Split priority:
 *   1. "\n\n"  — paragraph boundary (strongest)
 *   2. "\n"    — line boundary
 *   3. ". "    — sentence boundary
 *   4. raw chars — fallback hard-split
 *
 * Each chunk is prefixed with `[{title}]\n\n` when `options.title` is
 * provided, so isolated chunks retain document context when retrieved.
 *
 * Returns `Chunk[]` with `metadata.chunkIndex` and `metadata.totalChunks`.
 */
export function chunkText(
  text: string,
  options: ChunkOptions & ChunkOptionsLegacy = {},
): Chunk[] {
  const maxChars = options.maxChars ?? 800;
  const overlapChars = options.overlapChars ?? 150;
  const title = options.title;

  const trimmed = text.trim();
  if (!trimmed) return [];

  // Build raw chunk strings (no title prefix yet)
  const rawChunks = splitIntoChunks(trimmed, maxChars, overlapChars);

  const totalChunks = rawChunks.length;

  return rawChunks.map((body, index) => {
    const content = title ? `[${title}]\n\n${body}` : body;
    return {
      content,
      metadata: {
        chunkIndex: index,
        totalChunks,
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Internal split logic
// ---------------------------------------------------------------------------

/**
 * Recursively splits `text` into segments of at most `maxChars` characters,
 * trying separator boundaries in order of preference.
 */
function splitIntoChunks(
  text: string,
  maxChars: number,
  overlapChars: number,
): string[] {
  // If the full text fits, no split needed
  if (text.length <= maxChars) {
    return [text];
  }

  // Try splitting by these separators in order
  const separators = ["\n\n", "\n", ". ", " "];

  for (const sep of separators) {
    const segments = text.split(sep);
    if (segments.length <= 1) continue;

    const chunks: string[] = [];
    let current = "";

    for (let i = 0; i < segments.length; i++) {
      const piece = segments[i];
      const candidate = current
        ? current + sep + piece
        : piece;

      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        // Flush current chunk if non-empty
        if (current.trim()) {
          chunks.push(current.trim());
        }

        // If the single piece is still too large, recurse with next separator
        if (piece.length > maxChars) {
          const subChunks = splitIntoChunks(piece, maxChars, overlapChars);
          // Prefix the last sub-chunk as the new "current" for overlap
          for (let j = 0; j < subChunks.length - 1; j++) {
            chunks.push(subChunks[j]);
          }
          current = subChunks[subChunks.length - 1] ?? "";
        } else {
          current = piece;
        }
      }
    }

    // Push whatever remains
    if (current.trim()) {
      chunks.push(current.trim());
    }

    // If we managed to produce more than one chunk, apply overlap and return
    if (chunks.length > 1) {
      return applyOverlap(chunks, overlapChars);
    }

    // Only one chunk produced by this separator — try the next separator
  }

  // Fallback: hard-split by character boundaries
  return applyOverlap(hardSplit(text, maxChars), overlapChars);
}

/**
 * Hard-splits text into slices of exactly `maxChars` with no awareness of
 * word boundaries. Used as the final fallback.
 */
function hardSplit(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += maxChars) {
    chunks.push(text.slice(start, start + maxChars));
  }
  return chunks;
}

/**
 * Adds overlap between adjacent chunks by prepending the tail of the previous
 * chunk to the beginning of the next one.
 */
function applyOverlap(chunks: string[], overlapChars: number): string[] {
  if (overlapChars <= 0 || chunks.length <= 1) return chunks;

  const result: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const tail = prev.slice(-overlapChars);
    // Only prepend tail if it's meaningfully different from the chunk start
    const current = chunks[i];
    if (!current.startsWith(tail.slice(0, 20))) {
      result.push(tail + " " + current);
    } else {
      result.push(current);
    }
  }

  return result;
}
