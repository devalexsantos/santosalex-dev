"use client";

/**
 * RagVisualizer — interactive demo of the portfolio's RAG retrieval.
 *
 * Lets a visitor type a query, calls /api/playground/rag-search, and renders
 * the top-K AiChunks the search would feed to the LLM — with distance bars,
 * source type chips and content previews. No LLM call is made; this is the
 * retrieval-only half of the chat pipeline made visible.
 */

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Search,
  Loader2,
  Sparkles,
  FileText,
  Briefcase,
  HelpCircle,
  FolderGit2,
  BookOpen,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Chunk = {
  id: string;
  documentTitle: string;
  sourceType: string;
  sourceId: string | null;
  locale: string;
  distance: number;
  similarity: number;
  content: string;
  fallbackLocale: boolean;
};

const SOURCE_META: Record<
  string,
  { Icon: typeof FileText; label: string; tint: string }
> = {
  project:    { Icon: FolderGit2,  label: "Projeto",     tint: "text-violet-300 bg-violet-500/10 border-violet-500/20" },
  post:       { Icon: BookOpen,    label: "Post",        tint: "text-blue-300   bg-blue-500/10   border-blue-500/20" },
  profile:    { Icon: Sparkles,    label: "Perfil",      tint: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
  experience: { Icon: Briefcase,   label: "Experiência", tint: "text-amber-300  bg-amber-500/10  border-amber-500/20" },
  faq:        { Icon: HelpCircle,  label: "FAQ",         tint: "text-pink-300   bg-pink-500/10   border-pink-500/20" },
  page:       { Icon: StickyNote,  label: "Página",      tint: "text-cyan-300   bg-cyan-500/10   border-cyan-500/20" },
};

export function RagVisualizer() {
  const t = useTranslations("playground.rag");
  const locale = useLocale() as "pt-BR" | "en";

  const [query, setQuery] = useState("");
  const [chunks, setChunks] = useState<Chunk[] | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2 || loading) return;

    setLoading(true);
    setError(null);
    const started = performance.now();

    try {
      const res = await fetch("/api/playground/rag-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, locale, topK: 5 }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        chunks?: Chunk[];
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? t("error"));
        setChunks(null);
      } else {
        setChunks(data.chunks ?? []);
        setLatency(Math.round(performance.now() - started));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [query, locale, loading, t]);

  const suggestions = [
    t("suggestions.1"),
    t("suggestions.2"),
    t("suggestions.3"),
    t("suggestions.4"),
  ];

  return (
    <div className="space-y-6">
      {/* Query input */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12]/60 backdrop-blur-sm">
        <div className="flex items-end gap-2 px-4 py-3">
          <Search className="mb-2 h-4 w-4 shrink-0 text-primary/70" />
          <textarea
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void run();
              }
            }}
            placeholder={t("placeholder")}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="button"
            onClick={() => void run()}
            disabled={loading || query.trim().length < 2}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary/90 px-3 text-xs font-medium text-white transition-all hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {t("submit")}
          </button>
        </div>
      </div>

      {/* Suggestion chips */}
      {chunks === null && !loading && !error && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
              }}
              className="rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-[12px] font-medium text-primary/80 transition-all hover:border-primary/40 hover:bg-primary/[0.12]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {chunks && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground/70">
            <span>
              {chunks.length === 0
                ? t("noResults")
                : t("foundN", { n: chunks.length })}
            </span>
            {latency !== null && (
              <span className="font-mono text-[10px] text-muted-foreground/40">
                {latency} ms · embedding + pgvector search
              </span>
            )}
          </div>

          {chunks.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-8 text-center text-sm text-muted-foreground">
              {t("noResultsHint")}
            </div>
          ) : (
            <ol className="space-y-3">
              {chunks.map((chunk, idx) => {
                const meta = SOURCE_META[chunk.sourceType] ?? SOURCE_META.page;
                const Icon = meta.Icon;
                return (
                  <li
                    key={chunk.id}
                    className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] px-4 py-2.5">
                      <span className="font-mono text-[10px] text-muted-foreground/40">
                        #{idx + 1}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          meta.tint,
                        )}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {meta.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {chunk.locale}
                      </span>
                      {chunk.fallbackLocale && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          {t("fallback")}
                        </span>
                      )}
                      <span className="truncate text-xs font-medium text-foreground/80">
                        {chunk.documentTitle}
                      </span>
                      <span className="ml-auto flex items-center gap-2 text-[11px]">
                        <span className="font-mono text-muted-foreground/60">
                          d={chunk.distance.toFixed(3)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-semibold",
                            chunk.similarity >= 50
                              ? "bg-emerald-500/10 text-emerald-300"
                              : chunk.similarity >= 30
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-white/[0.05] text-muted-foreground",
                          )}
                        >
                          {chunk.similarity}%
                        </span>
                      </span>
                    </div>

                    {/* Similarity bar */}
                    <div className="h-0.5 bg-white/[0.04]">
                      <div
                        className="h-full bg-gradient-to-r from-primary/60 to-secondary/60"
                        style={{
                          width: `${Math.max(0, Math.min(100, chunk.similarity))}%`,
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="max-h-48 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {chunk.content}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
