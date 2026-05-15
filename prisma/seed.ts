import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TechnologyCategory, ExperienceLevel } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const technologies = [
    { slug: "nextjs", name: "Next.js", category: TechnologyCategory.frontend, experienceLevel: ExperienceLevel.advanced },
    { slug: "react", name: "React", category: TechnologyCategory.frontend, experienceLevel: ExperienceLevel.advanced },
    { slug: "typescript", name: "TypeScript", category: TechnologyCategory.frontend, experienceLevel: ExperienceLevel.advanced },
    { slug: "tailwindcss", name: "TailwindCSS", category: TechnologyCategory.frontend, experienceLevel: ExperienceLevel.advanced },
    { slug: "nodejs", name: "Node.js", category: TechnologyCategory.backend, experienceLevel: ExperienceLevel.advanced },
    { slug: "prisma", name: "Prisma", category: TechnologyCategory.backend, experienceLevel: ExperienceLevel.advanced },
    { slug: "postgresql", name: "PostgreSQL", category: TechnologyCategory.database, experienceLevel: ExperienceLevel.intermediate },
    { slug: "pgvector", name: "pgvector", category: TechnologyCategory.database, experienceLevel: ExperienceLevel.intermediate },
    { slug: "redis", name: "Redis", category: TechnologyCategory.database, experienceLevel: ExperienceLevel.intermediate },
    { slug: "docker", name: "Docker", category: TechnologyCategory.infra, experienceLevel: ExperienceLevel.intermediate },
    { slug: "openai", name: "OpenAI", category: TechnologyCategory.ai, experienceLevel: ExperienceLevel.advanced },
  ];

  for (const t of technologies) {
    await prisma.technology.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  await prisma.project.upsert({
    where: { slug: "advlink" },
    update: {},
    create: {
      slug: "advlink",
      title: "AdvLink",
      shortDescription:
        "Site builder multi-tenant para advogados, com SEO local e analytics embutido.",
      category: "saas",
      status: "shipped",
      year: 2024,
      featured: true,
      order: 1,
      content: {
        "pt-BR": {
          problem:
            "Advogados precisam de presença digital profissional, rápida e acessível.",
          hypothesis:
            "Um site builder nichado para advogados converte melhor do que plataformas genéricas.",
          targetAudience: "Advogados autônomos e pequenos escritórios no Brasil.",
          technicalDecisions:
            "Arquitetura multi-tenant, subdomínios por usuário, blog separado, SEO local como parte do produto.",
          learnings:
            "Redução de fricção no onboarding; importância de nicho em SaaS; infra com VPS como alternativa à Vercel.",
        },
        en: {
          problem:
            "Lawyers need a professional, fast and accessible digital presence.",
          hypothesis:
            "A niche site builder for lawyers converts better than generic platforms.",
          targetAudience: "Solo lawyers and small law firms in Brazil.",
          technicalDecisions:
            "Multi-tenant architecture, per-user subdomains, separate blog, local SEO as a product feature.",
          learnings:
            "Lower onboarding friction; importance of niche SaaS; VPS infra as an alternative to Vercel.",
        },
      },
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
