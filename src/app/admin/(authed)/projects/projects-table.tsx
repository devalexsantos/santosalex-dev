"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Star, ExternalLink } from "lucide-react";
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
import { deleteProject } from "./_actions";
import { cn } from "@/lib/utils";
import { TranslationStatusBadge, type TranslationStatus } from "@/components/admin/translation-status-badge";

type Project = {
  id: string;
  slug: string;
  title: string;
  categories: string[];
  status: string;
  translationStatus: TranslationStatus;
  year: number | null;
  featured: boolean;
  order: number;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:       { label: "Draft",       className: "bg-white/5 text-white/40" },
  in_progress: { label: "In Progress", className: "bg-amber-500/10 text-amber-400" },
  shipped:     { label: "Shipped",     className: "bg-emerald-500/10 text-emerald-400" },
  archived:    { label: "Archived",    className: "bg-white/5 text-white/30" },
};

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteProject(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Projeto excluído.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm text-white/30">Nenhum projeto cadastrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs text-white/40 font-medium">#</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Título / Slug</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Categoria</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Status</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Ano</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Destaque</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Tradução EN</TableHead>
              <TableHead className="text-xs text-white/40 font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const status = statusConfig[project.status] ?? { label: project.status, className: "bg-white/5 text-white/40" };
              return (
                <TableRow
                  key={project.id}
                  className="border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell className="text-xs text-white/30 w-10">{project.order}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-white/85">{project.title}</p>
                      <p className="text-[11px] font-mono text-white/30">{project.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium uppercase text-white/40"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", status.className)}>
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/40">{project.year ?? "—"}</TableCell>
                  <TableCell>
                    {project.featured && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <TranslationStatusBadge status={project.translationStatus} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/pt-BR/projects/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-white/60"
                        title="Ver no site"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-violet-400"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(project)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/[0.08] bg-[#111118] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Tem certeza que deseja excluir <strong className="text-white/80">{deleteTarget?.title}</strong>? Todas as features, decisões e stack serão removidas. Esta ação não pode ser desfeita.
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
