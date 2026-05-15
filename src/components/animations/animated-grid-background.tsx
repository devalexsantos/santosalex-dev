"use client";

/**
 * AnimatedGridBackground
 *
 * CSS-only animated grid + radial glow.
 * Respects prefers-reduced-motion (animation handled in globals.css).
 * Should be dynamically imported at the usage site.
 */
export function AnimatedGridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Animated dot-grid */}
      <div className="animated-grid grid-fade-mask absolute inset-0" />

      {/* Ambient violet glow — hero top */}
      <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/18 blur-[120px]" />

      {/* Ambient cyan glow — bottom right */}
      <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/3 translate-y-1/4 rounded-full bg-accent/10 blur-[120px]" />

      {/* Subtle purple tint — left edge */}
      <div className="absolute left-0 top-1/2 h-[500px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[100px]" />
    </div>
  );
}
