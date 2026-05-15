"use client";

/**
 * PortfolioChatTrigger — floating action button in the bottom-right corner.
 *
 * Opens the global PortfolioChat dialog by dispatching a custom event:
 *   window.dispatchEvent(new CustomEvent("portfolio-chat:open"))
 *
 * Design rationale: a custom event bus (instead of Zustand or Context) is the
 * simplest cross-component communication that doesn't require wrapping the
 * entire app in a provider. PortfolioChat already listens for this event.
 *
 * This component is mounted once in the [locale] layout, so it appears on
 * all public pages. It is NOT rendered on /admin routes because the layout
 * file for admin is separate.
 */

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { PortfolioChat } from "./portfolio-chat";

export function PortfolioChatTrigger() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render FAB on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Also respond to the global open event (from navbar / hero CTAs)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("portfolio-chat:open", handler);
    return () => window.removeEventListener("portfolio-chat:open", handler);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("title")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:block">{t("title")}</span>
      </button>

      {/* Chat dialog — controlled by FAB */}
      <PortfolioChat
        open={open}
        onOpenChange={setOpen}
        variant="modal"
      />
    </>
  );
}
