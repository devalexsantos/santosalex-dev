"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { projectSchema, type ProjectFormValues } from "@/lib/validators/project";
import { saveProject, translateProjectToEn } from "@/app/admin/(authed)/projects/_actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TranslationStatusBadge, type TranslationStatus } from "./translation-status-badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Technology {
  id: string;
  slug: string;
  name: string;
}

interface ProjectFormProps {
  projectId: string | null;
  defaultValues: Partial<ProjectFormValues>;
  technologies: Technology[];
}

// ---------------------------------------------------------------------------
// Field row helpers
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputClass =
  "border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/50";
const textareaClass = cn(inputClass, "min-h-[120px] resize-y");

// ---------------------------------------------------------------------------
// ProjectForm
// ---------------------------------------------------------------------------

export function ProjectForm({
  projectId,
  defaultValues,
  technologies,
}: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Track the displayed translation status separately so we can update it
  // reactively after the AI action without a full page reload.
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>(
    (defaultValues.translationStatus as TranslationStatus) ?? "draft"
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProjectFormValues, any, ProjectFormValues>({
    resolver: zodResolver(projectSchema) as never,
    defaultValues: {
      translationStatus: "draft",
      markReviewed: false,
      slug: "",
      title: "",
      shortDescription: "",
      category: "saas",
      status: "draft",
      year: null,
      featured: false,
      order: 0,
      coverImage: "",
      demoUrl: "",
      githubUrl: "",
      content: {
        "pt-BR": {
          problem: "",
          hypothesis: "",
          targetAudience: "",
          technicalDecisions: "",
          learnings: "",
          nextSteps: "",
          fullDescription: "",
        },
        en: {
          problem: "",
          hypothesis: "",
          targetAudience: "",
          technicalDecisions: "",
          learnings: "",
          nextSteps: "",
          fullDescription: "",
        },
      },
      architecture: { "pt-BR": "", en: "" },
      challenges: { "pt-BR": "", en: "" },
      techSlugs: [],
      features: [],
      decisions: [],
      ...defaultValues,
    },
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
    move: moveFeature,
  } = useFieldArray({ control, name: "features" });

  const {
    fields: decisionFields,
    append: appendDecision,
    remove: removeDecision,
    move: moveDecision,
  } = useFieldArray({ control, name: "decisions" });

  const watchedTechSlugs = watch("techSlugs");
  const watchedPtContent = watch("content.pt-BR");
  const watchedArch = watch("architecture");
  const watchedChallenges = watch("challenges");
  const markReviewedValue = watch("markReviewed");

  // PT has meaningful content if at least "problem" is non-empty
  const ptHasContent = !!watchedPtContent?.problem?.trim();
  // AI translate button is only active when editing a saved project
  const canTranslate = !!projectId && ptHasContent;

  function toggleTech(slug: string) {
    const current = watchedTechSlugs ?? [];
    if (current.includes(slug)) {
      setValue("techSlugs", current.filter((s) => s !== slug));
    } else {
      setValue("techSlugs", [...current, slug]);
    }
  }

  // ── AI translate handler ──
  async function handleTranslate() {
    if (!projectId) return;
    setIsTranslating(true);
    try {
      const result = await translateProjectToEn(projectId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Prefill EN form fields with translated content
      const { content, architecture, challenges } = result.enFields;
      setValue("content.en.fullDescription", content.fullDescription ?? "");
      setValue("content.en.problem", content.problem ?? "");
      setValue("content.en.hypothesis", content.hypothesis ?? "");
      setValue("content.en.targetAudience", content.targetAudience ?? "");
      setValue("content.en.technicalDecisions", content.technicalDecisions ?? "");
      setValue("content.en.learnings", content.learnings ?? "");
      setValue("content.en.nextSteps", content.nextSteps ?? "");
      setValue("architecture.en", architecture);
      setValue("challenges.en", challenges);
      setValue("translationStatus", result.translationStatus);
      setTranslationStatus(result.translationStatus);
      // Switch to EN tab so the user sees the result immediately
      setActiveTab("en");
      toast.success("Tradução gerada! Revise e salve quando estiver pronto.");
    } finally {
      setIsTranslating(false);
    }
  }

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      const result = await saveProject(projectId, values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Projeto salvo com sucesso.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {[
            { value: "general", label: "Geral" },
            {
              value: "pt-BR",
              label: (
                <span className="flex items-center gap-1.5">
                  PT-BR
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                    fonte
                  </span>
                </span>
              ),
            },
            {
              value: "en",
              label: (
                <span className="flex items-center gap-1.5">
                  EN
                  <TranslationStatusBadge status={translationStatus} />
                </span>
              ),
            },
            { value: "stack", label: "Stack" },
            { value: "features", label: "Funcionalidades" },
            { value: "decisions", label: "Decisões" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 data-active:bg-violet-500/15 data-active:text-violet-300"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TAB: GERAL ── */}
        <TabsContent value="general" className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Slug" required>
              <Input
                className={inputClass}
                placeholder="my-project"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-xs text-red-400">{errors.slug.message}</p>
              )}
            </FieldRow>
            <FieldRow label="Título" required>
              <Input
                className={inputClass}
                placeholder="My Project"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </FieldRow>
          </div>

          <FieldRow label="Descrição curta" required>
            <Input
              className={inputClass}
              placeholder="Uma linha de elevador"
              {...register("shortDescription")}
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Categoria" required>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
                      {[
                        "saas",
                        "ai",
                        "frontend",
                        "fullstack",
                        "automation",
                        "infra",
                        "experiment",
                      ].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>
            <FieldRow label="Status" required>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/[0.08] bg-[#111118] text-white">
                      {["draft", "in_progress", "shipped", "archived"].map(
                        (v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FieldRow label="Ano">
              <Input
                className={inputClass}
                type="number"
                placeholder="2025"
                {...register("year", { valueAsNumber: true })}
              />
            </FieldRow>
            <FieldRow label="Ordem">
              <Input
                className={inputClass}
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
            </FieldRow>
            <FieldRow label="Destaque">
              <div className="flex h-9 items-center">
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-violet-600"
                    />
                  )}
                />
              </div>
            </FieldRow>
          </div>

          <FieldRow label="URL da capa">
            <Input
              className={inputClass}
              placeholder="https://..."
              {...register("coverImage")}
            />
          </FieldRow>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Demo URL">
              <Input
                className={inputClass}
                placeholder="https://..."
                {...register("demoUrl")}
              />
            </FieldRow>
            <FieldRow label="GitHub URL">
              <Input
                className={inputClass}
                placeholder="https://github.com/..."
                {...register("githubUrl")}
              />
            </FieldRow>
          </div>
        </TabsContent>

        {/* ── TAB: PT-BR ── */}
        <TabsContent value="pt-BR" className="space-y-5">
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] text-white/40">
              Este é o conteúdo fonte. Edite primeiro em pt-BR, depois gere a
              tradução na aba EN.
            </p>
          </div>
          <LocaleContentFields
            control={control}
            locale="pt-BR"
            register={register}
          />
          <FieldRow label="Arquitetura">
            <Textarea
              className={textareaClass}
              placeholder="Descreva a arquitetura do projeto..."
              {...register("architecture.pt-BR")}
            />
          </FieldRow>
          <FieldRow label="Desafios">
            <Textarea
              className={textareaClass}
              placeholder="Descreva os desafios encontrados..."
              {...register("challenges.pt-BR")}
            />
          </FieldRow>
        </TabsContent>

        {/* ── TAB: EN ── */}
        <TabsContent value="en" className="space-y-5">
          {/* AI Translation panel */}
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white/80">
                    Tradução automática com IA
                  </p>
                  <TranslationStatusBadge status={translationStatus} />
                </div>
                <p className="text-[11px] text-white/40">
                  {!projectId
                    ? "Salve o projeto primeiro para habilitar a tradução."
                    : !ptHasContent
                    ? "Preencha ao menos o campo Problema em pt-BR para habilitar."
                    : "Gera um rascunho em inglês a partir do conteúdo pt-BR. Revise antes de salvar."}
                </p>
              </div>
              <Button
                type="button"
                disabled={!canTranslate || isTranslating}
                onClick={handleTranslate}
                className={cn(
                  "shrink-0 gap-1.5 text-xs font-medium transition-all",
                  canTranslate
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-violet-400"
                    : "border border-white/[0.06] bg-transparent text-white/25"
                )}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Traduzindo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Gerar tradução com IA
                  </>
                )}
              </Button>
            </div>

            {/* Mark as reviewed switch */}
            {translationStatus === "translated" && (
              <div className="mt-4 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                <Controller
                  control={control}
                  name="markReviewed"
                  render={({ field }) => (
                    <Switch
                      id="markReviewed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
                <label
                  htmlFor="markReviewed"
                  className="cursor-pointer text-xs text-white/60"
                >
                  Marcar como revisado ao salvar
                  {markReviewedValue && (
                    <span className="ml-1.5 text-emerald-400">
                      — o status será atualizado para{" "}
                      <strong>Revisado</strong>
                    </span>
                  )}
                </label>
              </div>
            )}
          </div>

          <LocaleContentFields
            control={control}
            locale="en"
            register={register}
          />
          <FieldRow label="Architecture">
            <Textarea
              className={textareaClass}
              placeholder="Describe the project architecture..."
              {...register("architecture.en")}
            />
          </FieldRow>
          <FieldRow label="Challenges">
            <Textarea
              className={textareaClass}
              placeholder="Describe the challenges encountered..."
              {...register("challenges.en")}
            />
          </FieldRow>
        </TabsContent>

        {/* ── TAB: STACK ── */}
        <TabsContent value="stack">
          <p className="mb-3 text-xs text-white/40">
            Clique para selecionar/deselecionar tecnologias.
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => {
              const selected = (watchedTechSlugs ?? []).includes(tech.slug);
              return (
                <button
                  key={tech.slug}
                  type="button"
                  onClick={() => toggleTech(tech.slug)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.15] hover:text-white/70"
                  )}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* ── TAB: FEATURES ── */}
        <TabsContent value="features" className="space-y-4">
          {featureFields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40">
                  Funcionalidade #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => idx > 0 && moveFeature(idx, idx - 1)}
                    className="rounded p-1 text-white/30 hover:text-white/60 disabled:opacity-20"
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      idx < featureFields.length - 1 &&
                      moveFeature(idx, idx + 1)
                    }
                    className="rounded p-1 text-white/30 hover:text-white/60"
                    disabled={idx === featureFields.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="rounded p-1 text-red-400/60 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Título PT-BR">
                  <Input
                    className={inputClass}
                    placeholder="..."
                    {...register(`features.${idx}.title.pt-BR`)}
                  />
                </FieldRow>
                <FieldRow label="Title EN">
                  <Input
                    className={inputClass}
                    placeholder="..."
                    {...register(`features.${idx}.title.en`)}
                  />
                </FieldRow>
                <FieldRow label="Descrição PT-BR">
                  <Textarea
                    className={cn(inputClass, "min-h-[80px] resize-none")}
                    placeholder="..."
                    {...register(`features.${idx}.description.pt-BR`)}
                  />
                </FieldRow>
                <FieldRow label="Description EN">
                  <Textarea
                    className={cn(inputClass, "min-h-[80px] resize-none")}
                    placeholder="..."
                    {...register(`features.${idx}.description.en`)}
                  />
                </FieldRow>
              </div>
              <input
                type="hidden"
                {...register(`features.${idx}.order`, { valueAsNumber: true })}
                value={idx + 1}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendFeature({
                title: { "pt-BR": "", en: "" },
                description: { "pt-BR": "", en: "" },
                order: featureFields.length + 1,
              })
            }
            className="border-white/[0.08] bg-transparent text-white/50 hover:border-violet-500/30 hover:text-violet-300"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar funcionalidade
          </Button>
        </TabsContent>

        {/* ── TAB: DECISIONS ── */}
        <TabsContent value="decisions" className="space-y-4">
          {decisionFields.map((field, idx) => (
            <div
              key={field.id}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40">
                  Decisão #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => idx > 0 && moveDecision(idx, idx - 1)}
                    className="rounded p-1 text-white/30 hover:text-white/60"
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      idx < decisionFields.length - 1 &&
                      moveDecision(idx, idx + 1)
                    }
                    className="rounded p-1 text-white/30 hover:text-white/60"
                    disabled={idx === decisionFields.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDecision(idx)}
                    className="rounded p-1 text-red-400/60 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldRow label="Título PT-BR">
                  <Input
                    className={inputClass}
                    placeholder="..."
                    {...register(`decisions.${idx}.title.pt-BR`)}
                  />
                </FieldRow>
                <FieldRow label="Title EN">
                  <Input
                    className={inputClass}
                    placeholder="..."
                    {...register(`decisions.${idx}.title.en`)}
                  />
                </FieldRow>
                <FieldRow label="Motivo PT-BR">
                  <Textarea
                    className={cn(inputClass, "min-h-[70px] resize-none")}
                    placeholder="..."
                    {...register(`decisions.${idx}.reason.pt-BR`)}
                  />
                </FieldRow>
                <FieldRow label="Reason EN">
                  <Textarea
                    className={cn(inputClass, "min-h-[70px] resize-none")}
                    placeholder="..."
                    {...register(`decisions.${idx}.reason.en`)}
                  />
                </FieldRow>
                <FieldRow label="Descrição PT-BR">
                  <Textarea
                    className={cn(inputClass, "min-h-[80px] resize-none")}
                    placeholder="..."
                    {...register(`decisions.${idx}.description.pt-BR`)}
                  />
                </FieldRow>
                <FieldRow label="Description EN">
                  <Textarea
                    className={cn(inputClass, "min-h-[80px] resize-none")}
                    placeholder="..."
                    {...register(`decisions.${idx}.description.en`)}
                  />
                </FieldRow>
              </div>
              <input
                type="hidden"
                {...register(`decisions.${idx}.order`, { valueAsNumber: true })}
                value={idx + 1}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendDecision({
                title: { "pt-BR": "", en: "" },
                description: { "pt-BR": "", en: "" },
                reason: { "pt-BR": "", en: "" },
                order: decisionFields.length + 1,
              })
            }
            className="border-white/[0.08] bg-transparent text-white/50 hover:border-violet-500/30 hover:text-violet-300"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar decisão
          </Button>
        </TabsContent>
      </Tabs>

      {/* hidden fields synced to form state */}
      <input type="hidden" {...register("translationStatus")} />

      {/* Submit */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-white/40 hover:text-white/70"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Locale content fields sub-component
// ---------------------------------------------------------------------------

function LocaleContentFields({
  locale,
  register,
}: {
  control: ReturnType<typeof useForm<ProjectFormValues>>["control"];
  locale: "pt-BR" | "en";
  register: ReturnType<typeof useForm<ProjectFormValues>>["register"];
}) {
  const prefix = `content.${locale}` as const;
  const isEn = locale === "en";
  const labels = isEn
    ? {
        problem: "Problem",
        hypothesis: "Hypothesis",
        targetAudience: "Target audience",
        technicalDecisions: "Technical decisions",
        learnings: "Learnings",
        nextSteps: "Next steps",
        fullDescription: "Full description",
      }
    : {
        problem: "Problema",
        hypothesis: "Hipótese",
        targetAudience: "Público-alvo",
        technicalDecisions: "Decisões técnicas",
        learnings: "Aprendizados",
        nextSteps: "Próximos passos",
        fullDescription: "Descrição completa",
      };

  return (
    <div className="space-y-5">
      <FieldRow label={labels.fullDescription}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.fullDescription` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
      <FieldRow label={labels.problem}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(`${prefix}.problem` as Parameters<typeof register>[0])}
        />
      </FieldRow>
      <FieldRow label={labels.hypothesis}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.hypothesis` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
      <FieldRow label={labels.targetAudience}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.targetAudience` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
      <FieldRow label={labels.technicalDecisions}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.technicalDecisions` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
      <FieldRow label={labels.learnings}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.learnings` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
      <FieldRow label={labels.nextSteps}>
        <Textarea
          className={textareaClass}
          placeholder="..."
          {...register(
            `${prefix}.nextSteps` as Parameters<typeof register>[0]
          )}
        />
      </FieldRow>
    </div>
  );
}
