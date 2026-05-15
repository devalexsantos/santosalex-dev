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
import { technologySchema, type TechnologyFormValues } from "@/lib/validators/technology";
import { saveTechnology } from "@/app/admin/(authed)/technologies/_actions";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "frontend",   label: "Frontend" },
  { value: "backend",    label: "Backend" },
  { value: "database",   label: "Banco de Dados" },
  { value: "ai",         label: "IA" },
  { value: "devops",     label: "DevOps" },
  { value: "infra",      label: "Infraestrutura" },
  { value: "automation", label: "Automação" },
  { value: "payments",   label: "Pagamentos" },
  { value: "email",      label: "Email" },
  { value: "testing",    label: "Testes" },
  { value: "other",      label: "Outros" },
] as const;

const LEVELS = [
  { value: "learning",     label: "Aprendendo" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced",     label: "Avançado" },
  { value: "expert",       label: "Expert" },
] as const;

interface TechnologyFormProps {
  technologyId?: string;
  defaultValues?: Partial<TechnologyFormValues>;
}

export function TechnologyForm({ technologyId, defaultValues }: TechnologyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologySchema) as never,
    defaultValues: {
      slug: defaultValues?.slug ?? "",
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "other",
      experienceLevel: defaultValues?.experienceLevel ?? "intermediate",
      icon: defaultValues?.icon ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const watchedCategory = watch("category");
  const watchedLevel = watch("experienceLevel");

  function onSubmit(data: TechnologyFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await saveTechnology(technologyId, data);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      }
      // On success, _actions redirects to /admin/technologies
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Row: slug + name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-xs font-medium text-white/60">
            Slug <span className="text-red-400">*</span>
          </Label>
          <Input
            id="slug"
            {...register("slug")}
            placeholder="next-js"
            className="border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40"
          />
          {errors.slug && (
            <p className="text-[11px] text-red-400">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-white/60">
            Nome <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Next.js"
            className="border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40"
          />
          {errors.name && (
            <p className="text-[11px] text-red-400">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Row: category + level */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/60">
            Categoria <span className="text-red-400">*</span>
          </Label>
          <Select
            value={watchedCategory}
            onValueChange={(v) => setValue("category", v as TechnologyFormValues["category"])}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-white/90 focus:ring-violet-500/40">
              <SelectValue placeholder="Selecionar categoria" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="focus:bg-white/[0.06]">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-[11px] text-red-400">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-white/60">
            Nível de experiência <span className="text-red-400">*</span>
          </Label>
          <Select
            value={watchedLevel}
            onValueChange={(v) => setValue("experienceLevel", v as TechnologyFormValues["experienceLevel"])}
          >
            <SelectTrigger className="border-white/[0.08] bg-white/[0.03] text-white/90 focus:ring-violet-500/40">
              <SelectValue placeholder="Selecionar nível" />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value} className="focus:bg-white/[0.06]">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experienceLevel && (
            <p className="text-[11px] text-red-400">{errors.experienceLevel.message}</p>
          )}
        </div>
      </div>

      {/* Icon */}
      <div className="space-y-1.5">
        <Label htmlFor="icon" className="text-xs font-medium text-white/60">
          Ícone
        </Label>
        <Input
          id="icon"
          {...register("icon")}
          placeholder="SiNextdotjs  ou  https://cdn.example.com/logo.svg"
          className="border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40"
        />
        <p className="text-[11px] text-white/30">
          Aceita nome de ícone Simple Icons (ex: <code className="font-mono">SiNextdotjs</code>) ou URL de imagem. Usado pela página pública de Stack.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-medium text-white/60">
          Descrição
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={3}
          placeholder="Breve descrição do uso desta tecnologia..."
          className="border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/40 resize-none"
        />
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
          {isPending ? "Salvando..." : "Salvar tecnologia"}
        </button>
      </div>
    </form>
  );
}
