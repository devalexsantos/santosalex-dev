"use client";

/**
 * RecruiterMode — interactive role picker + streamed summary.
 *
 * Flow:
 *   1. User picks one of 6 canonical role types (chip grid).
 *   2. POST /api/recruiter-summary with { roleId, locale } returns SSE stream.
 *   3. Markdown response streams into a card below the picker.
 *   4. On stream completion, the picker becomes a "try another role" toggle.
 *
 * Reuses the same markdown rendering pattern as the chat widget.
 */

import { useCallback, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Loader2,
  Code2,
  Layers,
  Target,
  Brain,
  Rocket,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "frontend-developer",  Icon: Code2  },
  { id: "fullstack-developer", Icon: Layers },
  { id: "product-engineer",    Icon: Target },
  { id: "ai-engineer",         Icon: Brain  },
  { id: "saas-builder",        Icon: Rocket },
  { id: "startup-developer",   Icon: Zap    },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

type StreamCallbacks = {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
};

async function streamSummary(
  body: { roleId: RoleId; locale: string },
  callbacks: StreamCallbacks,
  signal: AbortSignal,
) {
  const res = await fetch("/api/recruiter-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    callbacks.onError(
      (data as { error?: string }).error ?? "Rate limit exceeded.",
    );
    callbacks.onDone();
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    callbacks.onError((data as { error?: string }).error ?? "Request failed.");
    callbacks.onDone();
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError("No response body.");
    callbacks.onDone();
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      try {
        const event = JSON.parse(jsonStr) as {
          chunk?: string;
          done?: boolean;
          error?: string;
        };
        if (event.chunk) callbacks.onChunk(event.chunk);
        if (event.error) callbacks.onError(event.error);
        if (event.done) {
          callbacks.onDone();
          return;
        }
      } catch {
        // skip malformed events
      }
    }
  }

  callbacks.onDone();
}

export function RecruiterMode() {
  const t = useTranslations("recruiter");
  const locale = useLocale() as "pt-BR" | "en";

  const [activeRole, setActiveRole] = useState<RoleId | null>(null);
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handlePickRole = useCallback(
    async (roleId: RoleId) => {
      if (isStreaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setActiveRole(roleId);
      setSummary("");
      setError(null);
      setIsStreaming(true);

      let acc = "";
      let hadError = false;

      try {
        await streamSummary(
          { roleId, locale },
          {
            onChunk: (c) => {
              acc += c;
              setSummary(acc);
            },
            onError: (msg) => {
              hadError = true;
              setError(msg);
            },
            onDone: () => {
              // handled via state in onChunk/onError
            },
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !hadError) {
          setError(t("error"));
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, locale, t],
  );

  const resetPicker = useCallback(() => {
    abortRef.current?.abort();
    setActiveRole(null);
    setSummary("");
    setError(null);
    setIsStreaming(false);
  }, []);

  const showPicker = !activeRole;
  const showSummary = !!activeRole;

  return (
    <div className="space-y-8">
      {/* Picker */}
      {showPicker && (
        <div>
          <div className="mb-6 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary/80">
              {t("pickRole")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pickRoleHint")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map(({ id, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => void handlePickRole(id)}
                disabled={isStreaming}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left",
                  "transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.04]",
                  "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.20),0_0_25px_rgba(139,92,246,0.10)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mb-1.5 text-sm font-semibold tracking-tight text-foreground">
                    {t(`roles.${id}.label`)}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t(`roles.${id}.description`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary panel */}
      {showSummary && (
        <div className="space-y-4">
          {/* Active role header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.05] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary/70">
                {t("eyebrow")}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {t(`roles.${activeRole}.label`)}
              </span>
            </div>
            <button
              type="button"
              onClick={resetPicker}
              disabled={isStreaming}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              {t("regenerate")}
            </button>
          </div>

          {/* Summary card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12]/60 p-6 backdrop-blur-sm sm:p-8">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.03]" aria-hidden />

            <div className="relative">
              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : (
                <>
                  {isStreaming && summary.length === 0 ? (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>{t("generating")}</span>
                    </div>
                  ) : (
                    <article className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => (
                            <h2 className="mt-6 mb-2.5 text-base font-semibold uppercase tracking-widest text-primary/85 first:mt-0">
                              {children}
                            </h2>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 text-sm leading-relaxed text-foreground/85 last:mb-0">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-foreground/85">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-sm leading-relaxed text-foreground/85">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">
                              {children}
                            </strong>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
                            >
                              {children}
                            </a>
                          ),
                          code: ({ children }) => (
                            <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[12px] text-primary/80">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                      {isStreaming && (
                        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary/70 align-middle" />
                      )}
                    </article>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/50">
            {t("disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
