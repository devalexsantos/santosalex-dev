"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteTechnology } from "./_actions";
import { cn } from "@/lib/utils";

type Technology = {
  id: string;
  slug: string;
  name: string;
  category: string;
  experienceLevel: string;
  icon: string | null;
};

// Category badge colors — mirrors the public StackBadge visual language
const categoryConfig: Record<string, { label: string; className: string }> = {
  frontend:   { label: "Frontend",     className: "bg-blue-500/10 text-blue-400" },
  backend:    { label: "Backend",      className: "bg-violet-500/10 text-violet-400" },
  database:   { label: "Banco",        className: "bg-indigo-500/10 text-indigo-400" },
  ai:         { label: "IA",           className: "bg-fuchsia-500/10 text-fuchsia-400" },
  devops:     { label: "DevOps",       className: "bg-orange-500/10 text-orange-400" },
  infra:      { label: "Infra",        className: "bg-amber-500/10 text-amber-400" },
  automation: { label: "Automação",    className: "bg-cyan-500/10 text-cyan-400" },
  payments:   { label: "Pagamentos",   className: "bg-emerald-500/10 text-emerald-400" },
  email:      { label: "Email",        className: "bg-teal-500/10 text-teal-400" },
  testing:    { label: "Testes",       className: "bg-rose-500/10 text-rose-400" },
  other:      { label: "Outros",       className: "bg-white/5 text-white/40" },
};

const levelConfig: Record<string, { label: string; className: string }> = {
  learning:     { label: "Aprendendo",    className: "bg-white/5 text-white/40" },
  intermediate: { label: "Intermediário", className: "bg-amber-500/10 text-amber-400" },
  advanced:     { label: "Avançado",      className: "bg-blue-500/10 text-blue-400" },
  expert:       { label: "Expert",        className: "bg-emerald-500/10 text-emerald-400" },
};

export function TechnologiesTable({ technologies }: { technologies: Technology[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Technology | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTechnology(deleteTarget.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Tecnologia excluída.");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  if (technologies.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
        <p className="text-sm text-white/30">Nenhuma tecnologia cadastrada.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs text-white/40 font-medium">Nome / Slug</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Categoria</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Nível</TableHead>
              <TableHead className="text-xs text-white/40 font-medium">Ícone</TableHead>
              <TableHead className="text-xs text-white/40 font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technologies.map((tech) => {
              const cat = categoryConfig[tech.category] ?? { label: tech.category, className: "bg-white/5 text-white/40" };
              const level = levelConfig[tech.experienceLevel] ?? { label: tech.experienceLevel, className: "bg-white/5 text-white/40" };
              return (
                <TableRow
                  key={tech.id}
                  className="border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-white/85">{tech.name}</p>
                      <p className="text-[11px] font-mono text-white/30">{tech.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cat.className)}>
                      {cat.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", level.className)}>
                      {level.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tech.icon ? (
                      <span className="font-mono text-[11px] text-white/30 truncate max-w-[120px] block" title={tech.icon}>
                        {tech.icon.length > 20 ? tech.icon.slice(0, 20) + "…" : tech.icon}
                      </span>
                    ) : (
                      <span className="text-[11px] text-white/20">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/technologies/${tech.id}`}
                        className="rounded p-1.5 text-white/30 transition-colors hover:text-violet-400"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tech)}
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
            <AlertDialogTitle>Excluir tecnologia</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Tem certeza que deseja excluir{" "}
              <strong className="text-white/80">{deleteTarget?.name}</strong>? Esta ação não pode
              ser desfeita. Projetos que referenciam esta tecnologia terão o vínculo removido.
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
