"use client";

/**
 * PortfolioChat — the main conversational UI component.
 *
 * Design choices:
 * - Floating bottom-right FAB opens a Dialog-backed panel rather than an
 *   inline sheet. Rationale: the portfolio is content-dense; a modal dialog
 *   avoids competing with page content and gives the chat full focus.
 * - react-markdown renders assistant messages so LLM-generated markdown
 *   (bold, lists, links) displays correctly.
 * - Streaming: consumes SSE via fetch + ReadableStream.getReader().
 * - Session ID is generated once per page load and stored in sessionStorage.
 * - History is persisted in localStorage keyed by locale (cap: 20 messages).
 * - Rate-limit errors are surfaced inline as a "assistant" error bubble.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTranslations, useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Send, Trash2, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  isLoading?: boolean;
};

export type PortfolioChatProps = {
  /** When provided, scopes RAG search to a specific project */
  sourceType?: "project";
  sourceId?: string;
  /** Layout variant — "modal" opens as Dialog, "inline" renders in place */
  variant?: "modal" | "inline";
  /** Controlled open state for modal variant */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type PortfolioChatHandle = {
  open: () => void;
};

// ---------------------------------------------------------------------------
// Local storage helpers
// ---------------------------------------------------------------------------

function getHistoryKey(locale: string) {
  return `chat-history-${locale}`;
}

function loadHistory(locale: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getHistoryKey(locale));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

function saveHistory(locale: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getHistoryKey(locale),
      JSON.stringify(messages.slice(-20)),
    );
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Session ID
// ---------------------------------------------------------------------------

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const key = "portfolio-chat-session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

// ---------------------------------------------------------------------------
// SSE consumer
// ---------------------------------------------------------------------------

type StreamCallbacks = {
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
};

async function streamChatResponse(
  body: object,
  callbacks: StreamCallbacks,
  signal: AbortSignal,
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    callbacks.onError(
      (data as { error?: string }).error ??
        "Rate limit exceeded. Please wait a moment.",
    );
    callbacks.onDone();
    return;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    callbacks.onError(
      (data as { error?: string }).error ?? "Request failed.",
    );
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

    // Parse SSE events
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
        if (event.chunk) {
          callbacks.onChunk(event.chunk);
        }
        if (event.error) {
          callbacks.onError(event.error);
        }
        if (event.done) {
          callbacks.onDone();
          return;
        }
      } catch {
        // Malformed event — skip
      }
    }
  }

  callbacks.onDone();
}

// ---------------------------------------------------------------------------
// Suggestion chips
// ---------------------------------------------------------------------------

function SuggestionChips({
  suggestions,
  onSelect,
  disabled,
}: {
  suggestions: string[];
  onSelect: (s: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(s)}
          className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[12px] font-medium text-primary/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  if (msg.isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-secondary/60">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
          <span className="text-[10px] font-bold text-muted-foreground">Eu</span>
        </div>
      ) : (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-secondary/60">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary/20 text-foreground"
            : msg.isError
              ? "rounded-tl-sm border border-red-500/20 bg-red-500/5 text-red-300"
              : "rounded-tl-sm bg-white/[0.06] text-foreground/90",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12px] text-primary/80">
                  {children}
                </code>
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chat panel (the actual interactive content)
// ---------------------------------------------------------------------------

function ChatPanel({
  sourceType,
  sourceId,
  onClose,
  showCloseButton = false,
}: {
  sourceType?: "project";
  sourceId?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  const t = useTranslations("chat");
  const locale = useLocale() as "pt-BR" | "en";

  const suggestions = [
    t("suggestions.1"),
    t("suggestions.2"),
    t("suggestions.3"),
    t("suggestions.4"),
  ];

  const projectSuggestions = useTranslations("projectIntelligence");
  const pSuggestions = sourceType
    ? [
        projectSuggestions("suggestions.1"),
        projectSuggestions("suggestions.2"),
        projectSuggestions("suggestions.3"),
        projectSuggestions("suggestions.4"),
        projectSuggestions("suggestions.5"),
      ]
    : suggestions;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadHistory(locale),
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionId = useRef(getOrCreateSessionId());

  // Persist history on change
  useEffect(() => {
    const stable = messages.filter((m) => !m.isLoading);
    saveHistory(locale, stable);
  }, [messages, locale]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const loadingMsg: ChatMessage = {
        role: "assistant",
        content: "",
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");
      setIsStreaming(true);

      let assistantContent = "";
      let hasError = false;

      try {
        await streamChatResponse(
          {
            message: trimmed,
            locale,
            sessionId: sessionId.current,
            ...(sourceType ? { sourceType, sourceId } : {}),
          },
          {
            onChunk: (chunk) => {
              assistantContent += chunk;
              setMessages((prev) => {
                const next = [...prev];
                const lastIdx = next.length - 1;
                next[lastIdx] = {
                  role: "assistant",
                  content: assistantContent,
                  isLoading: false,
                };
                return next;
              });
            },
            onError: (msg) => {
              hasError = true;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content: msg,
                  isLoading: false,
                  isError: true,
                };
                return next;
              });
            },
            onDone: () => {
              // Already handled in onChunk / onError
            },
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          const errorMsg = hasError ? undefined : t("error");
          if (errorMsg) {
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "assistant",
                content: errorMsg,
                isLoading: false,
                isError: true,
              };
              return next;
            });
          }
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, locale, sourceType, sourceId, t],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const clearHistory = () => {
    abortRef.current?.abort();
    setMessages([]);
    saveHistory(locale, []);
    setIsStreaming(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-secondary/50">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{t("title")}</p>
            <p className="text-[10px] text-muted-foreground/60">{t("disclaimer")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="rounded-lg p-2 text-muted-foreground/50 transition-colors hover:bg-white/[0.05] hover:text-muted-foreground"
              title={t("clear")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground/50 transition-colors hover:bg-white/[0.05] hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Source hint */}
      {sourceType && (
        <div className="border-b border-white/[0.05] bg-primary/5 px-5 py-2">
          <p className="text-[11px] text-primary/60">
            <Sparkles className="mr-1 inline h-3 w-3" />
            {t("sourceHint")}
          </p>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/20">
              <Sparkles className="h-6 w-6 text-primary/80" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-foreground/80">
                {t("emptyTitle")}
              </p>
              <p className="text-xs text-muted-foreground/60">
                {t("emptySubtitle")}
              </p>
            </div>
            <SuggestionChips
              suggestions={pSuggestions}
              onSelect={(s) => void sendMessage(s)}
              disabled={isStreaming}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {/* Suggestions after last assistant message */}
            {!isStreaming && messages[messages.length - 1]?.role === "assistant" && (
              <div className="pt-2">
                <SuggestionChips
                  suggestions={pSuggestions.slice(0, 3)}
                  onSelect={(s) => void sendMessage(s)}
                  disabled={isStreaming}
                />
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-white/[0.08] p-4">
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 focus-within:border-primary/30 focus-within:bg-primary/[0.04] transition-colors duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            disabled={isStreaming}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/90 text-white transition-all duration-200 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("send")}
          >
            {isStreaming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/30">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PortfolioChat — modal variant
// ---------------------------------------------------------------------------

export const PortfolioChat = forwardRef<PortfolioChatHandle, PortfolioChatProps>(
  function PortfolioChat(
    {
      sourceType,
      sourceId,
      variant = "modal",
      open: controlledOpen,
      onOpenChange,
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(false);

    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    // Expose open() via ref so external buttons can trigger the dialog
    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    // Listen to global custom event for "open chat"
    useEffect(() => {
      const handler = () => setOpen(true);
      window.addEventListener("portfolio-chat:open", handler);
      return () => window.removeEventListener("portfolio-chat:open", handler);
    }, [setOpen]);

    if (variant === "inline") {
      return (
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12]/80 backdrop-blur-sm shadow-xl h-[520px] flex flex-col">
          <ChatPanel
            sourceType={sourceType}
            sourceId={sourceId}
            showCloseButton={false}
          />
        </div>
      );
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[620px] max-h-[90vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a12]/95 p-0 backdrop-blur-xl shadow-2xl shadow-primary/10"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>AI Chat</DialogTitle>
          </DialogHeader>
          <ChatPanel
            sourceType={sourceType}
            sourceId={sourceId}
            onClose={() => setOpen(false)}
            showCloseButton
          />
        </DialogContent>
      </Dialog>
    );
  },
);

PortfolioChat.displayName = "PortfolioChat";
