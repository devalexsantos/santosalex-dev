import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/profile-form";
import type { ProfileFormValues } from "@/lib/validators/profile";

export const metadata: Metadata = { title: "Perfil — Admin" };

// Default empty bilingual field shape
const emptyBilingual = { "pt-BR": "", en: "" };

export default async function ProfileAdminPage() {
  await requireAdminSession();

  // Ensure the singleton exists — upsert with empty defaults on first visit
  const profile = await prisma.profile.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      tagline: emptyBilingual,
      bio: emptyBilingual,
      approach: emptyBilingual,
      location: null,
      availability: null,
    },
    update: {},
  });

  const [roles, experiences, faqs] = await Promise.all([
    prisma.profileRoleType.findMany({ orderBy: { order: "asc" } }),
    prisma.profileExperience.findMany({ orderBy: { order: "asc" } }),
    prisma.profileFaq.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Shape the DB rows into the form's default values
  const initialData: ProfileFormValues = {
    tagline: (profile.tagline as { "pt-BR": string; en: string }) ?? emptyBilingual,
    bio: (profile.bio as { "pt-BR": string; en: string }) ?? emptyBilingual,
    approach: (profile.approach as { "pt-BR": string; en: string }) ?? emptyBilingual,
    location: profile.location ?? null,
    availability: profile.availability ?? null,
    roles: roles.map((r) => ({
      id: r.id,
      title: (r.title as { "pt-BR": string; en: string }) ?? emptyBilingual,
      description: (r.description as { "pt-BR": string; en: string }) ?? emptyBilingual,
      order: r.order,
    })),
    experiences: experiences.map((e) => ({
      id: e.id,
      company: e.company,
      role: (e.role as { "pt-BR": string; en: string }) ?? emptyBilingual,
      period: e.period,
      highlights: (e.highlights as { "pt-BR": string; en: string }) ?? emptyBilingual,
      order: e.order,
    })),
    faqs: faqs.map((f) => ({
      id: f.id,
      question: (f.question as { "pt-BR": string; en: string }) ?? emptyBilingual,
      answer: (f.answer as { "pt-BR": string; en: string }) ?? emptyBilingual,
      order: f.order,
    })),
  };

  return (
    <div className="px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Perfil</h1>
        <p className="mt-1 text-sm text-white/40">
          Bio, tipos de vaga, experiência e FAQs — conteúdo que alimenta o assistente de IA.
        </p>
      </div>

      <ProfileForm initialData={initialData} />
    </div>
  );
}
