import { cn } from "@/lib/utils";
import { GradientText } from "./gradient-text";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
  /** Use gradient text for the title */
  titleGradient?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleGradient = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        align === "start" && "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {titleGradient ? <GradientText>{title}</GradientText> : title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-base text-muted-foreground sm:text-lg",
            align === "center" && "max-w-2xl",
            align === "start" && "max-w-xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
