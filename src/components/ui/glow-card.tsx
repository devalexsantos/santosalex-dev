"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "accent";
  /** Disable the hover animation — useful when the card contains interactive children */
  noHover?: boolean;
}

export function GlowCard({
  children,
  className,
  glowColor = "primary",
  noHover = false,
}: GlowCardProps) {
  const glowStyles =
    glowColor === "accent"
      ? "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_0_30px_rgba(34,211,238,0.15)]"
      : "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_0_30px_rgba(139,92,246,0.15)]";

  if (noHover) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-white/[0.03]",
          "backdrop-blur-sm",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03]",
        "backdrop-blur-sm transition-all duration-300",
        "hover:border-white/[0.14]",
        glowStyles,
        className,
      )}
      whileHover={{ scale: 1.015, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
