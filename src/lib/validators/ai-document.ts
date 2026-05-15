import { z } from "zod";

export const aiDocumentSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  sourceType: z.enum(["project", "post", "profile", "experience", "faq", "page"]),
  sourceId: z.string().optional().or(z.literal("")),
  locale: z.enum(["pt-BR", "en"]),
  content: z.string().min(1, "Conteúdo obrigatório"),
  // JSON string — validated as parseable JSON if non-empty
  metadata: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val) return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Metadata deve ser JSON válido" }
    ),
});

export type AiDocumentFormValues = z.infer<typeof aiDocumentSchema>;
