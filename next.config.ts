import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Project / post coverImage URLs come from admin form input. Permissive
    // remotePatterns lets next/image optimize whatever host the admin uses
    // (Cloudflare Images, S3, Unsplash, etc.) without per-host config.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
