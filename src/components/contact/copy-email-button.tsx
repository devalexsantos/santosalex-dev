"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyEmailButtonProps {
  email: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}

export function CopyEmailButton({ email, copyLabel, copiedLabel, className }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-white/[0.1] bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground",
        className,
      )}
      aria-label={copied ? copiedLabel : copyLabel}
    >
      {copied ? (
        <>
          {/* Check icon */}
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {copiedLabel}
        </>
      ) : (
        <>
          {/* Copy icon */}
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copyLabel}
        </>
      )}
    </button>
  );
}
