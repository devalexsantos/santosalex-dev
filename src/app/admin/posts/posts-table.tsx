"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink, Globe } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePostGroup } from "./_actions";
import { cn } from "@/lib/utils";

type PostVersion = {
  id: string;
  slug: string;
  title: string;
  locale: string;
  translationGroupId: string;
  category: string;
  published: boolean;
  publishedAt: Date | null;
  readingTime: number | null;
};

type PostGroup = {
  groupId: string;
  versions: PostVersion[];
};

const categoryColors: Record<string, string> = {
  architecture: "bg-blue-500/10 text-blue-400",
  ai:           "bg-violet-500/10 text-violet-400",
  saas:         "bg-emerald-500/10 text-emerald-400",
  frontend:     "bg-sky-500/10 text-sky-400",
  backend:      "bg-amber-500/10 text-amber-400",
  infra:        "bg-orange-500/10 text-orange-400",
  product:      "bg-pink-500/10 text-pink-400",
  experiment:   "bg-rose-500/10 text-rose-400",
  deploy:       "bg-cyan-500/10 text-cyan-400",
  performance:  "bg-yellow-500/10 text-yellow-400",
};

export function PostsTable({ groups }: { groups: PostGroup[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PostGroup | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deletePostGroup(deleteTarget.groupId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm text-white/30">Nenhum post cadastrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs text-white/40 font-medium">Título (PT-BR)</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Categoria</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Locales</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Status</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Publicado em</TableHead>
              <TableHead className="text-xs text-white/40 font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(({ groupId, versions }) => {
              const ptVersion = versions.find((v) => v.locale === "pt-BR");
              const enVersion = versions.find((v) => v.locale === "en");
              const representative = ptVersion ?? versions[0];
              const publishedCount = versions.filter((v) => v.published).length;
              const isPublished = publishedCount > 0;
              const catColor = categoryColors[representative.category] ?? "bg-white/5 text-white/40";

              const publishedDate = representative.publishedAt
                ? new Intl.DateTimeFormat("pt-BR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(representative.publishedAt))
                : null;

              return (
                <TableRow
                  key={groupId}
                  className="border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-white/85">
                        {representative.title}
                      </p>
                      <p className="text-[11px] font-mono text-white/30">{groupId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", catColor)}>
                      {representative.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-white/30" />
                      <span className={cn("text-[11px]", ptVersion ? "text-emerald-400" : "text-red-400/60")}>PT</span>
                      <span className="text-white/20">/</span>
                      <span className={cn("text-[11px]", enVersion ? "text-emerald-400" : "text-red-400/60")}>EN</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isPublished ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                    )}>
                      {isPublished ? `${publishedCount}/2 publicado` : "Rascunho"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/40">
                    {publishedDate ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {ptVersion && (
                        <a
                          href={`/pt-BR/build-notes/${ptVersion.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-white/30 transition-colors hover:text-white/60"
                          title="Ver no site"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Link
                        href={`/admin/posts/${encodeURIComponent(groupId)}`}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-violet-400"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ groupId, versions })}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/[0.08] bg-[#111118] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir post</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Isso excluirá as versões em PT-BR e EN do post{" "}
              <strong className="text-white/80">{deleteTarget?.groupId}</strong>. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-transparent text-white/50 hover:bg-white/[0.04]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
