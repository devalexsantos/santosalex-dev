import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Build note article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_LABELS_PT: Record<string, string> = {
  architecture: "Arquitetura",
  ai: "IA",
  saas: "SaaS",
  frontend: "Frontend",
  backend: "Backend",
  infra: "Infra",
  product: "Produto",
  experiment: "Experimento",
  deploy: "Deploy",
  performance: "Performance",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  architecture: "Architecture",
  ai: "AI",
  saas: "SaaS",
  frontend: "Frontend",
  backend: "Backend",
  infra: "Infra",
  product: "Product",
  experiment: "Experiment",
  deploy: "Deploy",
  performance: "Performance",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const post = await prisma.post.findFirst({
    where: { locale, slug },
    select: {
      title: true,
      excerpt: true,
      category: true,
      readingTime: true,
      publishedAt: true,
    },
  });

  const title = post?.title ?? "Build note";
  const excerpt = post?.excerpt ?? "";
  const category =
    (locale === "pt-BR" ? CATEGORY_LABELS_PT : CATEGORY_LABELS_EN)[
      post?.category ?? ""
    ] ?? post?.category ?? "";
  const readingTime = post?.readingTime;
  const dateLabel = post?.publishedAt
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(post.publishedAt))
    : null;

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
            top: -180,
            left: -160,
            width: 540,
            height: 540,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 70%)",
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
              alex santos / build notes
            </div>
          </div>
          {category && (
            <div
              style={{
                padding: "10px 22px",
                borderRadius: 9999,
                border: "1px solid rgba(34,211,238,0.4)",
                background: "rgba(34,211,238,0.10)",
                color: "#67e8f9",
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

        {/* Title + excerpt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 1020,
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              background:
                "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {title.length > 90 ? title.slice(0, 90) + "…" : title}
          </div>
          {excerpt && (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: "rgba(248,250,252,0.65)",
                maxWidth: 960,
              }}
            >
              {excerpt.length > 180 ? excerpt.slice(0, 180) + "…" : excerpt}
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
                background: "#22d3ee",
                boxShadow: "0 0 8px rgba(34,211,238,0.6)",
              }}
            />
            <div style={{ display: "flex" }}>Build note</div>
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {readingTime ? <div style={{ display: "flex" }}>{readingTime} min</div> : null}
            {dateLabel ? <div style={{ display: "flex" }}>{dateLabel}</div> : null}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
