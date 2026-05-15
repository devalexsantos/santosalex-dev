"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { postSchema, type PostFormValues } from "@/lib/validators/post";
import { savePost, translatePostToEn } from "@/app/admin/posts/_actions";
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

interface PostFormProps {
  defaultValues: Partial<PostFormValues>;
  /** translationGroupId of the existing post group (null when creating new) */
  groupId: string | null;
}

function FieldRow({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

const inputClass =
  "border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/50";
const textareaClass = cn(inputClass, "min-h-[120px] resize-y");
const bigTextareaClass = cn(
  inputClass,
  "min-h-[400px] resize-y font-mono text-sm"
);

const POST_CATEGORIES = [
  "architecture",
  "ai",
  "saas",
  "frontend",
  "backend",
  "infra",
  "product",
  "experiment",
  "deploy",
  "performance",
] as const;

export function PostForm({ defaultValues, groupId }: PostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

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
  } = useForm<PostFormValues, any, PostFormValues>({
    resolver: zodResolver(postSchema) as never,
    defaultValues: {
      translationStatus: "draft",
      markReviewed: false,
      translationGroupId: "",
      category: "architecture",
      tags: "",
      published: false,
      publishedAt: null,
      readingTime: null,
      coverImage: "",
      "pt-BR": {
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        seoTitle: "",
        seoDescription: "",
      },
      en: {
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        seoTitle: "",
        seoDescription: "",
      },
      ...defaultValues,
    },
  });

  const watchedPtTitle = watch("pt-BR.title");
  const watchedPtContent = watch("pt-BR.content");
  const markReviewedValue = watch("markReviewed");

  // Auto-fill translationGroupId from PT-BR title slug if empty
  function handlePtTitleBlur() {
    const currentGroupId = watch("translationGroupId");
    if (!currentGroupId && watchedPtTitle) {
      const slug = watchedPtTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setValue("translationGroupId", slug);
    }
  }

  const ptHasContent = !!(watchedPtTitle?.trim() && watchedPtContent?.trim());
  // AI button only active when a saved group exists
  const canTranslate = !!groupId && ptHasContent;

  // ── AI translate handler ──
  async function handleTranslate() {
    if (!groupId) return;
    setIsTranslating(true);
    try {
      const result = await translatePostToEn(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { enFields } = result;
      setValue("en.slug", enFields.slug);
      setValue("en.title", enFields.title);
      setValue("en.excerpt", enFields.excerpt);
      setValue("en.content", enFields.content);
      setValue("en.seoTitle", enFields.seoTitle);
      setValue("en.seoDescription", enFields.seoDescription);
      setValue("translationStatus", result.translationStatus);
      setTranslationStatus(result.translationStatus);
      setActiveTab("en");
      toast.success("Tradução gerada! Revise e salve quando estiver pronto.");
    } finally {
      setIsTranslating(false);
    }
  }

  function onSubmit(values: PostFormValues) {
    startTransition(async () => {
      const result = await savePost(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post salvo com sucesso.");
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
          <FieldRow
            label="ID do grupo (slug base)"
            required
            hint="Agrupa as versões PT-BR e EN do mesmo post. Auto-preenchido pelo título PT-BR."
          >
            <Input
              className={inputClass}
              placeholder="my-post-slug"
              {...register("translationGroupId")}
            />
            {errors.translationGroupId && (
              <p className="text-xs text-red-400">
                {errors.translationGroupId.message}
              </p>
            )}
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
                      {POST_CATEGORIES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>
            <FieldRow label="Tempo de leitura (min)">
              <Input
                className={inputClass}
                type="number"
                placeholder="5"
                {...register("readingTime", { valueAsNumber: true })}
              />
            </FieldRow>
          </div>

          <FieldRow label="Tags (separadas por vírgula)">
            <Input
              className={inputClass}
              placeholder="nextjs, deploy, saas"
              {...register("tags")}
            />
          </FieldRow>

          <FieldRow label="URL da capa">
            <Input
              className={inputClass}
              placeholder="https://..."
              {...register("coverImage")}
            />
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Data de publicação">
              <Input
                className={inputClass}
                type="datetime-local"
                {...register("publishedAt")}
              />
            </FieldRow>
            <FieldRow label="Publicado">
              <div className="flex h-9 items-center">
                <Controller
                  control={control}
                  name="published"
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
        </TabsContent>

        {/* ── TAB: PT-BR ── */}
        <TabsContent value="pt-BR" className="space-y-5">
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] text-white/40">
              Este é o conteúdo fonte. Edite primeiro em pt-BR, depois gere a
              tradução na aba EN.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Slug" required>
              <Input
                className={inputClass}
                placeholder="meu-post"
                {...register("pt-BR.slug")}
              />
              {errors["pt-BR"]?.slug && (
                <p className="text-xs text-red-400">
                  {errors["pt-BR"].slug.message}
                </p>
              )}
            </FieldRow>
            <FieldRow label="Título" required>
              <Input
                className={inputClass}
                placeholder="Meu post"
                {...register("pt-BR.title", { onBlur: handlePtTitleBlur })}
              />
              {errors["pt-BR"]?.title && (
                <p className="text-xs text-red-400">
                  {errors["pt-BR"].title.message}
                </p>
              )}
            </FieldRow>
          </div>
          <FieldRow label="Resumo" required>
            <Textarea
              className={textareaClass}
              placeholder="Uma frase que descreve o post..."
              {...register("pt-BR.excerpt")}
            />
            {errors["pt-BR"]?.excerpt && (
              <p className="text-xs text-red-400">
                {errors["pt-BR"].excerpt.message}
              </p>
            )}
          </FieldRow>
          <FieldRow label="Conteúdo (Markdown)" required>
            <Textarea
              className={bigTextareaClass}
              placeholder="# Meu post..."
              {...register("pt-BR.content")}
            />
            {errors["pt-BR"]?.content && (
              <p className="text-xs text-red-400">
                {errors["pt-BR"].content.message}
              </p>
            )}
          </FieldRow>
          <FieldRow label="SEO Title">
            <Input
              className={inputClass}
              placeholder="Título para SEO (opcional)"
              {...register("pt-BR.seoTitle")}
            />
          </FieldRow>
          <FieldRow label="SEO Description">
            <Textarea
              className={cn(inputClass, "min-h-[80px] resize-none")}
              placeholder="Descrição para SEO (opcional)"
              {...register("pt-BR.seoDescription")}
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
                  {!groupId
                    ? "Salve o post primeiro para habilitar a tradução."
                    : !ptHasContent
                    ? "Preencha o título e conteúdo em pt-BR para habilitar."
                    : "Gera título, resumo, conteúdo e SEO em inglês. Revise antes de salvar."}
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
                      id="postMarkReviewed"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
                <label
                  htmlFor="postMarkReviewed"
                  className="cursor-pointer text-xs text-white/60"
                >
                  Marcar como revisado ao salvar
                  {markReviewedValue && (
                    <span className="ml-1.5 text-emerald-400">
                      — o status será atualizado para <strong>Revisado</strong>
                    </span>
                  )}
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Slug" required>
              <Input
                className={inputClass}
                placeholder="my-post"
                {...register("en.slug")}
              />
              {errors["en"]?.slug && (
                <p className="text-xs text-red-400">
                  {errors["en"].slug.message}
                </p>
              )}
            </FieldRow>
            <FieldRow label="Title" required>
              <Input
                className={inputClass}
                placeholder="My post"
                {...register("en.title")}
              />
              {errors["en"]?.title && (
                <p className="text-xs text-red-400">
                  {errors["en"].title.message}
                </p>
              )}
            </FieldRow>
          </div>
          <FieldRow label="Excerpt" required>
            <Textarea
              className={textareaClass}
              placeholder="One sentence describing the post..."
              {...register("en.excerpt")}
            />
            {errors["en"]?.excerpt && (
              <p className="text-xs text-red-400">
                {errors["en"].excerpt.message}
              </p>
            )}
          </FieldRow>
          <FieldRow label="Content (Markdown)" required>
            <Textarea
              className={bigTextareaClass}
              placeholder="# My post..."
              {...register("en.content")}
            />
            {errors["en"]?.content && (
              <p className="text-xs text-red-400">
                {errors["en"].content.message}
              </p>
            )}
          </FieldRow>
          <FieldRow label="SEO Title">
            <Input
              className={inputClass}
              placeholder="SEO title (optional)"
              {...register("en.seoTitle")}
            />
          </FieldRow>
          <FieldRow label="SEO Description">
            <Textarea
              className={cn(inputClass, "min-h-[80px] resize-none")}
              placeholder="SEO description (optional)"
              {...register("en.seoDescription")}
            />
          </FieldRow>
        </TabsContent>
      </Tabs>

      {/* hidden field synced to form state */}
      <input type="hidden" {...register("translationStatus")} />

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
