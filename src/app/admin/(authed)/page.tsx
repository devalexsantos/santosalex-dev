import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, FileText, Eye, Cpu, Database, MessagesSquare, UserCircle } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { RevalidateButton } from "./revalidate-button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [
    projectCount,
    publishedPostCount,
    draftPostCount,
    technologyCount,
    aiDocIndexed,
    aiDocPending,
    chatSessionCount,
    profileDocIndexed,
    profileDocPending,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.technology.count(),
    prisma.aiDocument.count({ where: { indexed: true } }),
    prisma.aiDocument.count({ where: { indexed: false } }),
    prisma.aiChatMessage.findMany({
      distinct: ["sessionId"],
      select: { sessionId: true },
    }).then((rows) => rows.length),
    prisma.aiDocument.count({
      where: { sourceType: { in: ["profile", "experience", "faq"] }, indexed: true },
    }),
    prisma.aiDocument.count({
      where: { sourceType: { in: ["profile", "experience", "faq"] }, indexed: false },
    }),
  ]);

  const stats = [
    {
      label: "Projetos",
      value: projectCount,
      href: "/admin/projects",
      icon: FolderKanban,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Posts publicados",
      value: publishedPostCount,
      href: "/admin/posts",
      icon: Eye,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Rascunhos",
      value: draftPostCount,
      href: "/admin/posts",
      icon: FileText,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Tecnologias",
      value: technologyCount,
      href: "/admin/technologies",
      icon: Cpu,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "AI Docs indexados",
      value: aiDocIndexed,
      href: "/admin/ai-documents",
      icon: Database,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      sub: aiDocPending > 0 ? `${aiDocPending} pendente${aiDocPending !== 1 ? "s" : ""}` : undefined,
    },
    {
      label: "Chat Sessions",
      value: chatSessionCount,
      href: "/admin/chat-logs",
      icon: MessagesSquare,
      color: "text-fuchsia-400",
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-500/20",
    },
    {
      label: "Perfil (docs RAG)",
      value: profileDocIndexed,
      href: "/admin/profile",
      icon: UserCircle,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      sub: profileDocPending > 0
        ? `${profileDocPending} pendente${profileDocPending !== 1 ? "s" : ""}`
        : undefined,
    },
  ] as const;

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Visão geral do portfólio</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon, color, bg, border, ...rest }) => {
          const sub = "sub" in rest ? rest.sub : undefined;
          return (
            <Link
              key={label}
              href={href}
              className={`group rounded-xl border ${border} ${bg} p-5 transition-all hover:brightness-110`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</p>
                  <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
                  {sub && (
                    <p className="mt-1 text-[11px] text-amber-400">{sub}</p>
                  )}
                </div>
                <div className={`rounded-lg ${bg} p-2.5`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
          Ações rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/projects/new"
            className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-violet-500/25 hover:bg-violet-500/5 hover:text-white"
          >
            + Novo projeto
          </Link>
          <Link
            href="/admin/posts/new"
            className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-violet-500/25 hover:bg-violet-500/5 hover:text-white"
          >
            + Novo post
          </Link>
          <Link
            href="/admin/technologies/new"
            className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-white"
          >
            + Nova tecnologia
          </Link>
          <Link
            href="/admin/ai-documents/new"
            className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-fuchsia-500/20 hover:bg-fuchsia-500/5 hover:text-white"
          >
            + Novo AI Document
          </Link>
          <RevalidateButton />
        </div>
      </div>
    </div>
  );
}
