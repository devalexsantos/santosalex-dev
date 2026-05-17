"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Size variants for individual bento cards.
 *
 * Sizes only "kick in" once the grid actually has multiple columns. On mobile
 * the grid collapses to 1 column and every card is 1×1 — otherwise a tall
 * (1×3) card would render as a 540px-high mostly-empty box on phones.
 *
 * sm  breakpoint: grid becomes 2 cols → wide/lg take full row, md/tall add height
 * lg  breakpoint: grid becomes 3 cols → tall card stretches full column (1×3)
 */
type BentoSize = "sm" | "md" | "lg" | "wide" | "tall";

const sizeClasses: Record<BentoSize, string> = {
  sm:   "col-span-1 row-span-1",
  md:   "col-span-1 row-span-1 sm:row-span-2",
  lg:   "col-span-1 row-span-1 sm:col-span-2 sm:row-span-2",
  wide: "col-span-1 row-span-1 sm:col-span-2",
  tall: "col-span-1 row-span-1 lg:row-span-3",
};

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        "auto-rows-[180px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  size?: BentoSize;
  className?: string;
  glowColor?: "primary" | "accent" | "none";
  onClick?: () => void;
  href?: string;
}

export function BentoCard({
  children,
  size = "sm",
  className,
  glowColor = "primary",
}: BentoCardProps) {
  const glowHoverClass =
    glowColor === "accent"
      ? "hover:shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_35px_rgba(34,211,238,0.12)]"
      : glowColor === "primary"
      ? "hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_0_35px_rgba(139,92,246,0.12)]"
      : "";

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        "relative overflow-hidden rounded-2xl",
        "border border-white/[0.07] bg-white/[0.03]",
        "backdrop-blur-sm",
        "transition-all duration-300",
        "hover:border-white/[0.12]",
        glowHoverClass,
        className,
      )}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}
