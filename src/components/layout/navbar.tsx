"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";

interface NavLink {
  labelKey: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { labelKey: "projects",      href: "/projects" },
  { labelKey: "buildNotes",    href: "/build-notes" },
  { labelKey: "stack",         href: "/stack" },
  { labelKey: "howIBuild",     href: "/how-i-build" },
  { labelKey: "about",         href: "/about" },
  { labelKey: "recruiterMode", href: "/recruiter" },
  { labelKey: "contact",       href: "/contact" },
];

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.07] bg-[#05050a]/80 backdrop-blur-xl shadow-[0_1px_0_rgba(139,92,246,0.08)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* ── Brand ──────────────────────────────── */}
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Alex Santos — home"
        >
          {/* "AS" monogram mark */}
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-[13px] font-bold text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            AS
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-foreground sm:block">
            Alex Santos
          </span>
        </Link>

        {/* ── Desktop nav ────────────────────────── */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ labelKey, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        {/* ── Right cluster ──────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>

          {/* AI CTA — desktop */}
          <Button
            size="sm"
            className="hidden gap-1.5 bg-primary/90 text-white hover:bg-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.5)] transition-all duration-200 sm:flex"
            onClick={() => window.dispatchEvent(new CustomEvent("portfolio-chat:open"))}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("askAi")}
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>

            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-72 border-l border-white/[0.07] bg-[#05050a]/95 backdrop-blur-xl gap-0 p-0"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                    AS
                  </span>
                  <span className="text-sm font-semibold">Alex Santos</span>
                </Link>
                <SheetClose
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </SheetClose>
              </div>

              {/* Sheet nav */}
              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
                {NAV_LINKS.map(({ labelKey, href }) => (
                  <SheetClose
                    key={href}
                    render={
                      <Link
                        href={href}
                        className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                      >
                        {t(labelKey)}
                      </Link>
                    }
                  />
                ))}
              </nav>

              {/* Sheet footer */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.07] p-4 space-y-3">
                <LocaleSwitcher />
                <Button
                  size="sm"
                  className="w-full gap-1.5 bg-primary/90 text-white"
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new CustomEvent("portfolio-chat:open"));
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("askAi")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
