import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Alex Santos — Fullstack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #05050a 0%, #0a0518 50%, #1a0a2e 100%)",
          padding: "72px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Top: AS mark + site name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              boxShadow: "0 0 32px rgba(139,92,246,0.5)",
            }}
          >
            AS
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "rgba(248,250,252,0.85)",
            }}
          >
            {tCommon("siteName")}
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#a78bfa",
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            {tHome("eyebrow")}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#f8fafc",
              letterSpacing: -1.5,
            }}
          >
            <div style={{ display: "flex" }}>{tHome("title")}</div>
            <div
              style={{
                display: "flex",
                background:
                  "linear-gradient(135deg, #c4b5fd 0%, #a855f7 50%, #22d3ee 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {tHome("titleAccent")}
            </div>
          </div>
        </div>

        {/* Bottom row: tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "rgba(248,250,252,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#34d399",
              boxShadow: "0 0 12px rgba(52,211,153,0.6)",
            }}
          />
          <div style={{ display: "flex" }}>{tCommon("tagline")}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
