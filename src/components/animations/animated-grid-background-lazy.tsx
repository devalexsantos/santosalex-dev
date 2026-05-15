"use client";

import dynamic from "next/dynamic";

const AnimatedGridBackground = dynamic(
  () =>
    import("./animated-grid-background").then(
      (m) => m.AnimatedGridBackground,
    ),
  { ssr: false },
);

export function AnimatedGridBackgroundLazy() {
  return <AnimatedGridBackground />;
}
