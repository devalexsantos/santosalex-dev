import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Transcrição" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

const roleMeta: Record<string, { label: string; align: string; bubble: string; labelClass: string }> = {
  user: {
    label: "Usuário",
    align: "items-end",
    bubble: "bg-violet-500/10 border-violet-500/20 text-white/80",
    labelClass: "text-violet-400",
  },
  assistant: {
    label: "Assistente",
    align: "items-start",
    bubble: "bg-white/[0.03] border-white/[0.07] text-white/75",
    labelClass: "text-white/50",
  },
  system: {
    label: "Sistema",
    align: "items-start",
    bubble: "bg-amber-500/5 border-amber-500/10 text-white/40",
    labelClass: "text-amber-500/60",
  },
};

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireAdminSession();

  const { sessionId } = await params;

  const messages = await prisma.aiChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    include: {
      feedback: {
        select: { id: true, rating: true, comment: true, createdAt: true },
      },
    },
  });

  if (messages.length === 0) notFound();

  const locale = messages[0].locale;
  const firstCreated = messages[0].createdAt;
  const lastCreated = messages[messages.length - 1].createdAt;

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/chat-logs"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Chat Logs
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Transcrição</h1>

        {/* Session metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-white/40" title={sessionId}>
            {sessionId.slice(0, 24)}…
          </span>
          {locale && (
            <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/40">
              {locale}
            </span>
          )}
          <span className="text-[11px] text-white/25">
            {messages.length} mensagem{messages.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[11px] text-white/25">
            {formatDate(firstCreated)} → {formatDate(lastCreated)}
          </span>
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const meta = roleMeta[msg.role] ?? roleMeta.assistant;

          return (
            <div key={msg.id} className={cn("flex flex-col gap-1", meta.align)}>
              {/* Role + timestamp */}
              <div className="flex items-center gap-2 px-1">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.labelClass)}>
                  {meta.label}
                </span>
                <span className="text-[10px] text-white/20">{formatDate(msg.createdAt)}</span>
                {msg.ipHash && (
                  <span className="font-mono text-[10px] text-white/15" title="IP hash (truncado)">
                    ip:{msg.ipHash.slice(0, 8)}
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
                  meta.bubble
                )}
              >
                {msg.content}
              </div>

              {/* Feedback rows (if any) */}
              {msg.feedback.length > 0 && (
                <div className="ml-1 mt-1 space-y-1.5">
                  {msg.feedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="flex items-start gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                    >
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          fb.rating >= 4
                            ? "bg-emerald-500/10 text-emerald-400"
                            : fb.rating >= 2
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {fb.rating}/5
                      </span>
                      {fb.comment && (
                        <p className="text-[11px] text-white/40">{fb.comment}</p>
                      )}
                      <span className="ml-auto shrink-0 text-[10px] text-white/20">
                        {formatDate(fb.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
