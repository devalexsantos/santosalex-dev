import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Users,
  TrendingUp,
} from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Chat Logs" };

const PAGE_SIZE = 20;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminChatLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminSession();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  // Aggregate sessions: group by sessionId
  // Page rows + total count + portfolio-wide metrics fetched in parallel.
  const [sessionRows, totalSessionCount, metrics, last7d] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        sessionId: string;
        locale: string | null;
        message_count: bigint;
        first_created: Date;
        last_created: Date;
        positive_count: bigint;
        negative_count: bigint;
      }>
    >`
      SELECT
        m."sessionId",
        MIN(m."locale") AS locale,
        COUNT(m.id)::bigint AS message_count,
        MIN(m."createdAt") AS first_created,
        MAX(m."createdAt") AS last_created,
        COALESCE(SUM(feedback_split.pos), 0)::bigint AS positive_count,
        COALESCE(SUM(feedback_split.neg), 0)::bigint AS negative_count
      FROM "AiChatMessage" m
      LEFT JOIN (
        SELECT
          f."messageId",
          SUM(CASE WHEN f.rating > 0 THEN 1 ELSE 0 END) AS pos,
          SUM(CASE WHEN f.rating < 0 THEN 1 ELSE 0 END) AS neg
        FROM "AiFeedback" f
        GROUP BY f."messageId"
      ) feedback_split ON feedback_split."messageId" = m.id
      GROUP BY m."sessionId"
      ORDER BY MAX(m."createdAt") DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${(page - 1) * PAGE_SIZE}
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "sessionId")::bigint AS count FROM "AiChatMessage"
    `,
    prisma.$queryRaw<
      Array<{ messages: bigint; positive: bigint; negative: bigint }>
    >`
      SELECT
        (SELECT COUNT(*) FROM "AiChatMessage")::bigint AS messages,
        COALESCE(SUM(CASE WHEN rating > 0 THEN 1 ELSE 0 END), 0)::bigint AS positive,
        COALESCE(SUM(CASE WHEN rating < 0 THEN 1 ELSE 0 END), 0)::bigint AS negative
      FROM "AiFeedback"
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "sessionId")::bigint AS count
      FROM "AiChatMessage"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `,
  ]);

  const totalCount = Number(totalSessionCount[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const totalMessages = Number(metrics[0]?.messages ?? 0);
  const totalPositive = Number(metrics[0]?.positive ?? 0);
  const totalNegative = Number(metrics[0]?.negative ?? 0);
  const totalFeedback = totalPositive + totalNegative;
  const positiveRate =
    totalFeedback > 0 ? Math.round((totalPositive / totalFeedback) * 100) : null;
  const last7dCount = Number(last7d[0]?.count ?? 0);
  const avgMsgsPerSession =
    totalCount > 0 ? (totalMessages / totalCount).toFixed(1) : "0";

  // For each session, fetch the first user message preview
  const sessionIds = sessionRows.map((r) => r.sessionId);
  const firstUserMessages =
    sessionIds.length > 0
      ? await prisma.aiChatMessage.findMany({
          where: { sessionId: { in: sessionIds }, role: "user" },
          orderBy: { createdAt: "asc" },
          distinct: ["sessionId"],
          select: { sessionId: true, content: true },
        })
      : [];

  const firstMsgMap = new Map(firstUserMessages.map((m) => [m.sessionId, m.content]));

  if (totalCount === 0) {
    return (
      <div className="px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Chat Logs</h1>
          <p className="mt-1 text-sm text-white/40">Conversas do assistente de IA</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
          <MessageSquare className="mb-4 h-10 w-10 text-white/10" />
          <p className="text-sm font-medium text-white/40">Nenhuma conversa registrada ainda</p>
          <p className="mt-2 max-w-md text-xs text-white/25">
            A fase 5 (RAG / chat público) ainda não foi implementada. Quando o assistente de IA
            estiver ativo, as conversas aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Chat Logs</h1>
          <p className="mt-1 text-sm text-white/40">
            {totalCount} sessão{totalCount !== 1 ? "ões" : ""} registrada{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          icon={<Users className="h-3.5 w-3.5" />}
          label="Sessões totais"
          value={totalCount.toString()}
          subtitle={`${last7dCount} nos últimos 7 dias`}
        />
        <MetricCard
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label="Mensagens"
          value={totalMessages.toString()}
          subtitle={`${avgMsgsPerSession} / sessão em média`}
        />
        <MetricCard
          icon={<ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />}
          label="Feedback positivo"
          value={totalPositive.toString()}
          subtitle={
            positiveRate !== null ? `${positiveRate}% de aprovação` : "sem dados ainda"
          }
        />
        <MetricCard
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Feedback total"
          value={totalFeedback.toString()}
          subtitle={`${totalPositive} 👍 · ${totalNegative} 👎`}
        />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Session ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Locale</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Msgs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Primeira mensagem</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Início</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Último</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Feedback</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/40"></th>
            </tr>
          </thead>
          <tbody>
            {sessionRows.map((session) => {
              const preview = firstMsgMap.get(session.sessionId) ?? "";
              const truncated = preview.length > 60 ? preview.slice(0, 60) + "…" : preview;
              return (
                <tr
                  key={session.sessionId}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-white/40">
                      {session.sessionId.slice(0, 16)}…
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {session.locale ? (
                      <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/50">
                        {session.locale}
                      </span>
                    ) : (
                      <span className="text-[11px] text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {String(session.message_count)}
                  </td>
                  <td className="max-w-[220px] px-4 py-3">
                    <span className="text-xs text-white/50 italic">{truncated || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/30 whitespace-nowrap">
                    {formatDate(session.first_created)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/30 whitespace-nowrap">
                    {formatDate(session.last_created)}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const pos = Number(session.positive_count);
                      const neg = Number(session.negative_count);
                      if (pos === 0 && neg === 0) {
                        return <span className="text-[11px] text-white/20">—</span>;
                      }
                      return (
                        <div className="flex items-center gap-1.5">
                          {pos > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                              <ThumbsUp className="h-2.5 w-2.5" />
                              {pos}
                            </span>
                          )}
                          {neg > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                              <ThumbsDown className="h-2.5 w-2.5" />
                              {neg}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/chat-logs/${session.sessionId}`}
                      className="rounded p-1.5 text-white/30 transition-colors hover:text-violet-400"
                      title="Ver transcrição"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-white/30">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/admin/chat-logs?page=${page - 1}`}
                className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
              >
                <ChevronLeft className="h-3 w-3" />
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/chat-logs?page=${page + 1}`}
                className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
              >
                Próxima
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5",
    )}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/35">{subtitle}</p>
    </div>
  );
}
