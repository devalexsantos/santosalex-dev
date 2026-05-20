import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_LABELS_PT: Record<string, string> = {
  saas: "SaaS",
  ai: "AI",
  frontend: "Frontend",
  fullstack: "Fullstack",
  automation: "Automação",
  infra: "Infra",
  experiment: "Experimento",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  saas: "SaaS",
  ai: "AI",
  frontend: "Frontend",
  fullstack: "Fullstack",
  automation: "Automation",
  infra: "Infra",
  experiment: "Experiment",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      title: true,
      shortDescription: true,
      categories: true,
      year: true,
    },
  });

  const title = project?.title ?? "Project";
  const description = project?.shortDescription ?? "";
  const firstCategory = project?.categories[0] ?? "";
  const category =
    (locale === "pt-BR" ? CATEGORY_LABELS_PT : CATEGORY_LABELS_EN)[
      firstCategory
    ] ?? firstCategory;
  const year = project?.year;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #05050a 0%, #0a0518 50%, #1a0a2e 100%)",
          padding: "72px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(139,92,246,0.32) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                color: "white",
              }}
            >
              AS
            </div>
            <div style={{ fontSize: 22, color: "rgba(248,250,252,0.7)" }}>
              alex santos / projects
            </div>
          </div>
          {category && (
            <div
              style={{
                padding: "10px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(139,92,246,0.12)",
                color: "#c4b5fd",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: -2,
              background:
                "linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.35,
                color: "rgba(248,250,252,0.65)",
                maxWidth: 920,
              }}
            >
              {description.length > 160
                ? description.slice(0, 160) + "…"
                : description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(248,250,252,0.45)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: "#8b5cf6",
                boxShadow: "0 0 8px rgba(139,92,246,0.6)",
              }}
            />
            <div style={{ display: "flex" }}>Case study</div>
          </div>
          {year ? <div style={{ display: "flex" }}>{year}</div> : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
