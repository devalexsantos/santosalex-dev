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
  /** Heading level for the title. Pass "h1" on the top-level header of a
   *  page that lacks an explicit h1; defaults to "h2" for inner sections. */
  as?: "h1" | "h2";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleGradient = false,
  as = "h2",
}: SectionHeaderProps) {
  const HeadingTag = as;
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
      <HeadingTag className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {titleGradient ? <GradientText>{title}</GradientText> : title}
      </HeadingTag>
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
