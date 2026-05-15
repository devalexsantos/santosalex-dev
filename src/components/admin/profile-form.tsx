"use client";

/**
 * ProfileForm — bilingual singleton form for Alex's profile data.
 *
 * Tab structure:
 * - "Geral"  — locale-agnostic fields: location, availability, experience
 *              company names, periods (these don't translate).
 * - "PT-BR"  — all bilingual fields in pt-BR: tagline, bio, approach,
 *              role titles/descriptions, experience role/highlights, FAQ q&a.
 * - "EN"     — same structure, English side.
 *
 * Design choice: Experience rows span both Geral (company + period) and the
 * per-locale tabs (role title + highlights). The row identity is shared via
 * the field array index so that edits in one tab don't discard the other.
 */

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validators/profile";
import { saveProfile } from "@/app/admin/(authed)/profile/_actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Styling constants (matches the rest of the admin design system)
// ---------------------------------------------------------------------------

const inputClass =
  "border-white/[0.08] bg-white/[0.03] text-white/90 placeholder:text-white/20 focus-visible:ring-violet-500/50";

const textareaClass = cn(inputClass, "min-h-[120px] resize-y");

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function FieldRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-white/60">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

/**
 * Small inline pill that turns green when the locale tab's required fields
 * are filled.
 */
function LocaleCompletionChip({
  locale,
  values,
}: {
  locale: "pt-BR" | "en";
  values: ProfileFormValues;
}) {
  const hasTagline = !!values.tagline[locale]?.trim();
  const hasBio = !!values.bio[locale]?.trim();
  const isComplete = hasTagline && hasBio;

  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
        isComplete
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-amber-500/10 text-amber-400",
      )}
    >
      {isComplete ? "ok" : "incompleto"}
    </span>
  );
}

/** Reorder + remove controls shared across all field arrays */
function ArrayItemControls({
  idx,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  label,
}: {
  idx: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold text-white/40">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={idx === 0}
          className="rounded p-1 text-white/30 hover:text-white/60 disabled:opacity-20"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={idx === total - 1}
          className="rounded p-1 text-white/30 hover:text-white/60 disabled:opacity-20"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-red-400/60 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileForm
// ---------------------------------------------------------------------------

interface ProfileFormProps {
  initialData: ProfileFormValues;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors: _errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProfileFormValues, any, ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as never,
    defaultValues: initialData,
  });

  const {
    fields: roleFields,
    append: appendRole,
    remove: removeRole,
    move: moveRole,
  } = useFieldArray({ control, name: "roles" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
    move: moveExp,
  } = useFieldArray({ control, name: "experiences" });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
    move: moveFaq,
  } = useFieldArray({ control, name: "faqs" });

  const watchedValues = watch();

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const result = await saveProfile(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const { processed, chunks, failed } = result.indexResult;
      if (failed > 0) {
        toast.warning(
          `Perfil salvo, mas ${failed} doc(s) falharam ao indexar. Verifique os logs.`,
        );
      } else {
        toast.success(
          `Perfil salvo — ${chunks} chunk${chunks !== 1 ? "s" : ""} gerado${chunks !== 1 ? "s" : ""} em ${processed} doc${processed !== 1 ? "s" : ""}.`,
        );
      }
    });
  }

  // ── Locale tabs label (with completion chip) ──
  const ptLabel = (
    <span className="flex items-center gap-1.5">
      PT-BR
      <LocaleCompletionChip locale="pt-BR" values={watchedValues} />
    </span>
  );

  const enLabel = (
    <span className="flex items-center gap-1.5">
      EN
      <LocaleCompletionChip locale="en" values={watchedValues} />
    </span>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Tab bar ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {[
            { value: "general", label: "Geral" },
            { value: "pt-BR", label: ptLabel },
            { value: "en", label: enLabel },
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

        {/* ════════════════════════════════════════════════════════════════
            TAB: GERAL
            Locale-agnostic fields: location, availability, experience
            company names and periods (these don't need translation).
        ════════════════════════════════════════════════════════════════ */}
        <TabsContent value="general" className="space-y-8">
          {/* Info note */}
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] text-white/40">
              Campos que não dependem de idioma. Textos bilíngues ficam nas abas PT-BR e EN.
            </p>
          </div>

          {/* Localização e disponibilidade */}
          <div className="space-y-5">
            <SectionDivider label="Informações gerais" />
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Localização" hint="Ex: São Paulo, SP — Brasil">
                <Input
                  className={inputClass}
                  placeholder="São Paulo, SP"
                  {...register("location")}
                />
              </FieldRow>
              <FieldRow
                label="Disponibilidade"
                hint="Ex: Disponível para freelance / Aberto a remoto"
              >
                <Input
                  className={inputClass}
                  placeholder="Disponível para novos projetos"
                  {...register("availability")}
                />
              </FieldRow>
            </div>
          </div>

          {/* Experiências — company + period only (locale-agnostic) */}
          <div className="space-y-4">
            <SectionDivider label="Experiência profissional — campos gerais" />
            <p className="text-[11px] text-white/35">
              Empresa e período são os mesmos em ambos os idiomas. Cargo e destaques ficam
              nas abas PT-BR / EN.
            </p>

            {expFields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <ArrayItemControls
                  idx={idx}
                  total={expFields.length}
                  onMoveUp={() => idx > 0 && moveExp(idx, idx - 1)}
                  onMoveDown={() => idx < expFields.length - 1 && moveExp(idx, idx + 1)}
                  onRemove={() => removeExp(idx)}
                  label={`Experiência #${idx + 1}`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Empresa">
                    <Input
                      className={inputClass}
                      placeholder="Acme Corp"
                      {...register(`experiences.${idx}.company`)}
                    />
                  </FieldRow>
                  <FieldRow label="Período">
                    <Input
                      className={inputClass}
                      placeholder="2023 — atual"
                      {...register(`experiences.${idx}.period`)}
                    />
                  </FieldRow>
                </div>
                <input
                  type="hidden"
                  {...register(`experiences.${idx}.order`, { valueAsNumber: true })}
                  value={idx}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendExp({
                  company: "",
                  role: { "pt-BR": "", en: "" },
                  period: "",
                  highlights: { "pt-BR": "", en: "" },
                  order: expFields.length,
                })
              }
              className="border-white/[0.08] bg-transparent text-white/50 hover:border-violet-500/30 hover:text-violet-300"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar experiência
            </Button>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════
            TAB: PT-BR
            All bilingual fields in pt-BR locale.
        ════════════════════════════════════════════════════════════════ */}
        <TabsContent value="pt-BR" className="space-y-8">
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] text-white/40">
              Conteúdo fonte em português. Preencha aqui primeiro, depois espelhe na aba EN.
            </p>
          </div>

          {/* Sobre */}
          <div className="space-y-5">
            <SectionDivider label="Sobre" />
            <FieldRow label="Tagline" hint="Uma linha. Ex: Fullstack dev focado em produtos com IA.">
              <Input
                className={inputClass}
                placeholder="Fullstack dev focado em produtos com IA."
                {...register("tagline.pt-BR")}
              />
            </FieldRow>
            <FieldRow label="Bio" hint="1 a 3 parágrafos apresentando Alex.">
              <Textarea
                className={textareaClass}
                placeholder="Sou desenvolvedor fullstack com foco em..."
                {...register("bio.pt-BR")}
              />
            </FieldRow>
            <FieldRow label="Abordagem / Como trabalho" hint="Descreva o processo e mentalidade de trabalho.">
              <Textarea
                className={cn(inputClass, "min-h-[100px] resize-y")}
                placeholder="Gosto de começar pelo problema, não pela solução..."
                {...register("approach.pt-BR")}
              />
            </FieldRow>
          </div>

          {/* Tipos de vaga */}
          <div className="space-y-4">
            <SectionDivider label="Tipos de vaga" />
            {roleFields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <ArrayItemControls
                  idx={idx}
                  total={roleFields.length}
                  onMoveUp={() => idx > 0 && moveRole(idx, idx - 1)}
                  onMoveDown={() => idx < roleFields.length - 1 && moveRole(idx, idx + 1)}
                  onRemove={() => removeRole(idx)}
                  label={`Tipo de vaga #${idx + 1}`}
                />
                <div className="space-y-3">
                  <FieldRow label="Título da vaga">
                    <Input
                      className={inputClass}
                      placeholder="Fullstack Developer"
                      {...register(`roles.${idx}.title.pt-BR`)}
                    />
                  </FieldRow>
                  <FieldRow label="Descrição">
                    <Textarea
                      className={cn(inputClass, "min-h-[80px] resize-none")}
                      placeholder="Por que Alex se encaixa nessa vaga..."
                      {...register(`roles.${idx}.description.pt-BR`)}
                    />
                  </FieldRow>
                </div>
                <input
                  type="hidden"
                  {...register(`roles.${idx}.order`, { valueAsNumber: true })}
                  value={idx}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendRole({
                  title: { "pt-BR": "", en: "" },
                  description: { "pt-BR": "", en: "" },
                  order: roleFields.length,
                })
              }
              className="border-white/[0.08] bg-transparent text-white/50 hover:border-violet-500/30 hover:text-violet-300"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar tipo de vaga
            </Button>
          </div>

          {/* Experiência profissional — locale fields */}
          {expFields.length > 0 && (
            <div className="space-y-4">
              <SectionDivider label="Experiência profissional — PT-BR" />
              {expFields.map((field, idx) => {
                const company = watchedValues.experiences?.[idx]?.company;
                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                  >
                    <p className="mb-3 text-xs font-semibold text-white/40">
                      {company || `Experiência #${idx + 1}`}
                    </p>
                    <div className="space-y-3">
                      <FieldRow label="Cargo">
                        <Input
                          className={inputClass}
                          placeholder="Desenvolvedor Fullstack Senior"
                          {...register(`experiences.${idx}.role.pt-BR`)}
                        />
                      </FieldRow>
                      <FieldRow label="Destaques">
                        <Textarea
                          className={cn(inputClass, "min-h-[90px] resize-none")}
                          placeholder="Principais conquistas e responsabilidades..."
                          {...register(`experiences.${idx}.highlights.pt-BR`)}
                        />
                      </FieldRow>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQs */}
          <div className="space-y-4">
            <SectionDivider label="FAQs" />
            {faqFields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
              >
                <ArrayItemControls
                  idx={idx}
                  total={faqFields.length}
                  onMoveUp={() => idx > 0 && moveFaq(idx, idx - 1)}
                  onMoveDown={() => idx < faqFields.length - 1 && moveFaq(idx, idx + 1)}
                  onRemove={() => removeFaq(idx)}
                  label={`FAQ #${idx + 1}`}
                />
                <div className="space-y-3">
                  <FieldRow label="Pergunta">
                    <Input
                      className={inputClass}
                      placeholder="Qual é a sua disponibilidade?"
                      {...register(`faqs.${idx}.question.pt-BR`)}
                    />
                  </FieldRow>
                  <FieldRow label="Resposta">
                    <Textarea
                      className={cn(inputClass, "min-h-[80px] resize-none")}
                      placeholder="Estou disponível para..."
                      {...register(`faqs.${idx}.answer.pt-BR`)}
                    />
                  </FieldRow>
                </div>
                <input
                  type="hidden"
                  {...register(`faqs.${idx}.order`, { valueAsNumber: true })}
                  value={idx}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendFaq({
                  question: { "pt-BR": "", en: "" },
                  answer: { "pt-BR": "", en: "" },
                  order: faqFields.length,
                })
              }
              className="border-white/[0.08] bg-transparent text-white/50 hover:border-violet-500/30 hover:text-violet-300"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar FAQ
            </Button>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════
            TAB: EN
            Mirror of PT-BR tab but for the English locale.
        ════════════════════════════════════════════════════════════════ */}
        <TabsContent value="en" className="space-y-8">
          <div className="rounded-lg border border-violet-500/[0.12] bg-violet-500/[0.03] px-4 py-3">
            <p className="text-[11px] text-white/40">
              English version. Mirror the PT-BR content and adapt naturally — do not translate
              word-for-word.
            </p>
          </div>

          {/* About (EN) */}
          <div className="space-y-5">
            <SectionDivider label="About" />
            <FieldRow label="Tagline" hint="One line. e.g. Fullstack dev focused on AI-powered products.">
              <Input
                className={inputClass}
                placeholder="Fullstack dev focused on AI-powered products."
                {...register("tagline.en")}
              />
            </FieldRow>
            <FieldRow label="Bio" hint="1 to 3 paragraphs introducing Alex.">
              <Textarea
                className={textareaClass}
                placeholder="I'm a fullstack developer focused on..."
                {...register("bio.en")}
              />
            </FieldRow>
            <FieldRow label="Approach / How I work" hint="Describe your work process and mindset.">
              <Textarea
                className={cn(inputClass, "min-h-[100px] resize-y")}
                placeholder="I like to start with the problem, not the solution..."
                {...register("approach.en")}
              />
            </FieldRow>
          </div>

          {/* Role types (EN) */}
          <div className="space-y-4">
            <SectionDivider label="Role types" />
            {roleFields.length === 0 && (
              <p className="text-[11px] text-white/30">
                Add role types in the PT-BR tab first.
              </p>
            )}
            {roleFields.map((field, idx) => {
              const ptTitle = watchedValues.roles?.[idx]?.title?.["pt-BR"];
              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <p className="mb-3 text-xs font-semibold text-white/40">
                    {ptTitle || `Role type #${idx + 1}`}
                  </p>
                  <div className="space-y-3">
                    <FieldRow label="Role title">
                      <Input
                        className={inputClass}
                        placeholder="Fullstack Developer"
                        {...register(`roles.${idx}.title.en`)}
                      />
                    </FieldRow>
                    <FieldRow label="Description">
                      <Textarea
                        className={cn(inputClass, "min-h-[80px] resize-none")}
                        placeholder="Why Alex fits this role..."
                        {...register(`roles.${idx}.description.en`)}
                      />
                    </FieldRow>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Experience (EN) — role + highlights only */}
          {expFields.length > 0 && (
            <div className="space-y-4">
              <SectionDivider label="Work experience — EN" />
              {expFields.map((field, idx) => {
                const company = watchedValues.experiences?.[idx]?.company;
                return (
                  <div
                    key={field.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                  >
                    <p className="mb-3 text-xs font-semibold text-white/40">
                      {company || `Experience #${idx + 1}`}
                    </p>
                    <div className="space-y-3">
                      <FieldRow label="Role title">
                        <Input
                          className={inputClass}
                          placeholder="Senior Fullstack Developer"
                          {...register(`experiences.${idx}.role.en`)}
                        />
                      </FieldRow>
                      <FieldRow label="Highlights">
                        <Textarea
                          className={cn(inputClass, "min-h-[90px] resize-none")}
                          placeholder="Main achievements and responsibilities..."
                          {...register(`experiences.${idx}.highlights.en`)}
                        />
                      </FieldRow>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQs (EN) */}
          <div className="space-y-4">
            <SectionDivider label="FAQs" />
            {faqFields.length === 0 && (
              <p className="text-[11px] text-white/30">Add FAQs in the PT-BR tab first.</p>
            )}
            {faqFields.map((field, idx) => {
              const ptQuestion = watchedValues.faqs?.[idx]?.question?.["pt-BR"];
              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <p className="mb-3 text-xs font-semibold text-white/40">
                    {ptQuestion || `FAQ #${idx + 1}`}
                  </p>
                  <div className="space-y-3">
                    <FieldRow label="Question">
                      <Input
                        className={inputClass}
                        placeholder="What is your availability?"
                        {...register(`faqs.${idx}.question.en`)}
                      />
                    </FieldRow>
                    <FieldRow label="Answer">
                      <Textarea
                        className={cn(inputClass, "min-h-[80px] resize-none")}
                        placeholder="I'm available for..."
                        {...register(`faqs.${idx}.answer.en`)}
                      />
                    </FieldRow>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Sticky save bar ── */}
      <div className="sticky bottom-0 z-10 -mx-1 border-t border-white/[0.06] bg-[#080810]/95 px-1 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-white/30">
            O perfil alimenta o assistente de IA diretamente — salvar re-indexa o conteúdo.
          </p>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Salvando e indexando...
              </>
            ) : (
              "Salvar e re-indexar"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
