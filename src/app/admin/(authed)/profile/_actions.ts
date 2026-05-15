"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validators/profile";
import { syncProfileToAiDocuments } from "@/lib/ai/sync";
import { indexAllPendingDocuments, type BulkIndexResult } from "@/lib/ai/indexing";

// ---------------------------------------------------------------------------
// saveProfile
// ---------------------------------------------------------------------------

export type SaveProfileResult =
  | { ok: true; indexResult: BulkIndexResult }
  | { ok: false; error: string };

export async function saveProfile(rawData: ProfileFormValues): Promise<SaveProfileResult> {
  await requireAdminSession();

  const parsed = profileFormSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert the singleton profile row
      await tx.profile.upsert({
        where: { id: "singleton" },
        update: {
          tagline: data.tagline,
          bio: data.bio,
          approach: data.approach,
          location: data.location ?? null,
          availability: data.availability ?? null,
        },
        create: {
          id: "singleton",
          tagline: data.tagline,
          bio: data.bio,
          approach: data.approach,
          location: data.location ?? null,
          availability: data.availability ?? null,
        },
      });

      // Delete-and-recreate for roles (simpler than diffing; tables are small)
      await tx.profileRoleType.deleteMany();
      if (data.roles.length > 0) {
        await tx.profileRoleType.createMany({
          data: data.roles.map((r, i) => ({
            title: r.title,
            description: r.description,
            order: r.order ?? i,
          })),
        });
      }

      // Delete-and-recreate for experiences
      await tx.profileExperience.deleteMany();
      if (data.experiences.length > 0) {
        await tx.profileExperience.createMany({
          data: data.experiences.map((e, i) => ({
            company: e.company,
            role: e.role,
            period: e.period,
            highlights: e.highlights,
            order: e.order ?? i,
          })),
        });
      }

      // Delete-and-recreate for FAQs
      await tx.profileFaq.deleteMany();
      if (data.faqs.length > 0) {
        await tx.profileFaq.createMany({
          data: data.faqs.map((f, i) => ({
            question: f.question,
            answer: f.answer,
            order: f.order ?? i,
          })),
        });
      }
    });
  } catch (err) {
    console.error("[saveProfile] Transaction error:", err);
    return { ok: false, error: "Erro ao salvar perfil. Tente novamente." };
  }

  // Sync AiDocument rows for all profile data
  try {
    await syncProfileToAiDocuments();
  } catch (err) {
    console.error("[saveProfile] syncProfileToAiDocuments error:", err);
    // Do not block save — rows will be picked up on next sync
  }

  // Auto-reindex all pending documents (synchronous; accepts the latency)
  let indexResult: BulkIndexResult = {
    processed: 0,
    failed: 0,
    chunks: 0,
    errors: [],
  };

  try {
    indexResult = await indexAllPendingDocuments();
  } catch (err) {
    console.error("[saveProfile] indexAllPendingDocuments error:", err);
    // Non-fatal — rows remain indexed=false for manual retry
  }

  // Revalidate public pages that might surface profile data in the future
  for (const locale of ["pt-BR", "en"]) {
    revalidatePath(`/${locale}`, "layout");
    revalidatePath(`/${locale}/contact`, "page");
  }

  return { ok: true, indexResult };
}

// ---------------------------------------------------------------------------
// getProfileStats — used by the admin dashboard
// ---------------------------------------------------------------------------

export type ProfileStats = {
  indexed: number;
  pending: number;
};

export async function getProfileStats(): Promise<ProfileStats> {
  const [indexed, pending] = await Promise.all([
    prisma.aiDocument.count({
      where: {
        sourceType: { in: ["profile", "experience", "faq"] },
        indexed: true,
      },
    }),
    prisma.aiDocument.count({
      where: {
        sourceType: { in: ["profile", "experience", "faq"] },
        indexed: false,
      },
    }),
  ]);

  return { indexed, pending };
}
