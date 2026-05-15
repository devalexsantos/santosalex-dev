"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiDocumentSchema, type AiDocumentFormValues } from "@/lib/validators/ai-document";
import { saveAiDocument } from "@/app/admin/(authed)/ai-documents/_actions";
import { cn } from "@/lib/utils";

const SOURCE_TYPES = [
  { value: "project",    label: "Projeto" },
  { value: "post",       label: "Post" },
  { value: "profile",    label: "Perfil" },
  { value: "experience", label: "Experiência" },
  { value: "faq",        label: "FAQ" },
  { value: "page",       label: "Página" },
] as const;

const LOCALES = [
  { value: "pt-BR", label: "Português (pt-BR)" },
  { value: "en",    label: "English (en)" },
] as const;

interface AiDocumentFormProps {
  documentId?: string;
  defaultValues?: Partial<AiDocumentFormValues>;
}

export function AiDocumentForm({ documentId, defaultValues }: AiDocumentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AiDocumentFormValues>({
    resolver: zodResolver(aiDocumentSchema) as never,
    defaultValues: {
      title: defaultValues?.title ?? "",
      sourceType: defaultValues?.sourceType ?? "profile",
      sourceId: defaultValues?.sourceId ?? "",
      locale: defaultValues?.locale ?? "pt-BR",
      content: defaultValues?.content ?? "",
      metadata: defaultValues?.metadata ?? "",
    },
  });

  const watchedSourceType = watch("sourceType");
  const watchedLocale = watch("locale");

  function onSubmit(data: AiDocumentFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await saveAiDocument(documentId, data);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      }
      // On success, _actions redirects to /admin/ai-documents
    });
  }

  const showSourceId = watchedSourceType === "project" || watchedSourceType === "post";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-medium text-white/60">
          Título <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Descrição do projeto XYZ"
          className="border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40"
        />
        {errors.title && (
          <p className="text-[11px] text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Row: sourceType + locale */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/60">
            Tipo de fonte <span className="text-red-400">*</span>
          </Label>
          <Select
            value={watchedSourceType}
            onValueChange={(v) => setValue("sourceType", v as AiDocumentFormValues["sourceType"])}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-white/90 focus:ring-violet-500/40">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
              {SOURCE_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="focus:bg-white/[0.06]">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sourceType && (
            <p className="text-[11px] text-red-400">{errors.sourceType.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/60">
            Locale <span className="text-red-400">*</span>
          </Label>
          <Select
            value={watchedLocale}
            onValueChange={(v) => setValue("locale", v as AiDocumentFormValues["locale"])}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-white/90 focus:ring-violet-500/40">
              <SelectValue placeholder="Selecionar locale" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
              {LOCALES.map((l) => (
                <SelectItem key={l.value} value={l.value} className="focus:bg-white/[0.06]">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.locale && (
            <p className="text-[11px] text-red-400">{errors.locale.message}</p>
          )}
        </div>
      </div>

      {/* Source ID — shown for project / post */}
      {showSourceId && (
        <div className="space-y-1.5">
          <Label htmlFor="sourceId" className="text-xs font-medium text-white/60">
            Source ID
          </Label>
          <Input
            id="sourceId"
            {...register("sourceId")}
            placeholder={watchedSourceType === "project" ? "ID do projeto (cuid)" : "ID do post (cuid)"}
            className="border-white/[0.08] bg-white/[0.03] font-mono text-sm text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40"
          />
          <p className="text-[11px] text-white/30">
            ID do {watchedSourceType === "project" ? "Project" : "Post"} no banco (campo{" "}
            <code className="font-mono">id</code>). Usado pelo RAG para filtros de contexto.
          </p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="content" className="text-xs font-medium text-white/60">
          Conteúdo (Markdown) <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="content"
          {...register("content")}
          rows={14}
          placeholder="# Título&#10;&#10;Conteúdo em Markdown que será fragmentado (chunked) e embedado para RAG..."
          className="border-white/[0.08] bg-white/[0.03] font-mono text-sm text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40 resize-y"
        />
        {errors.content && (
          <p className="text-[11px] text-red-400">{errors.content.message}</p>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-1.5">
        <Label htmlFor="metadata" className="text-xs font-medium text-white/60">
          Metadata (JSON)
        </Label>
        <Textarea
          id="metadata"
          {...register("metadata")}
          rows={4}
          placeholder={'{"category": "saas", "year": 2024}'}
          className="border-white/[0.08] bg-white/[0.03] font-mono text-sm text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40 resize-y"
        />
        {errors.metadata && (
          <p className="text-[11px] text-red-400">{errors.metadata.message}</p>
        )}
        <p className="text-[11px] text-white/30">
          JSON livre — usado pelo RAG para filtros adicionais (categoria, locale, source, etc.).
          Deixe vazio se não precisar.
        </p>
      </div>

      {/* Save notice */}
      <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] text-white/30">
          Ao salvar, o documento será marcado como{" "}
          <strong className="text-amber-400">Pendente</strong> (indexed = false).
          A pipeline de embeddings processará este documento quando a Fase 5 for implementada.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors",
            isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-violet-700"
          )}
        >
          {isPending ? "Salvando..." : "Salvar documento"}
        </button>
      </div>
    </form>
  );
}
