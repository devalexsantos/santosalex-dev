import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";

// Brand icons — lucide-react v1 dropped social icons; using inline SVG
function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface FooterLink {
  labelKey: string;
  href: string;
}

const NAV_LINKS: FooterLink[] = [
  { labelKey: "projects",   href: "/projects" },
  { labelKey: "buildNotes", href: "/build-notes" },
  { labelKey: "stack",      href: "/stack" },
  { labelKey: "howIBuild",  href: "/how-i-build" },
  { labelKey: "contact",    href: "/contact" },
];

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/devalexsantos",
    Icon: IconGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/devalexsantos/",
    Icon: IconLinkedin,
  },
];

export async function Footer() {
  const t = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/[0.07]">
      {/* Subtle top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* ── Col 1: Brand ───────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-[13px] font-bold text-white">
                AS
              </span>
              <span className="text-sm font-semibold text-foreground">
                Alex Santos
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {tCommon("tagline")}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Navigation ──────────────── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              {tFooter("navigation")}
            </p>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {NAV_LINKS.map(({ labelKey, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground w-fit"
                >
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Col 3: CTA / Info ──────────────── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              {tFooter("contactTitle")}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tFooter("contactText")}
            </p>
            <a
              href="mailto:devalexsantos@gmail.com"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80 w-fit"
            >
              devalexsantos@gmail.com
            </a>
          </div>
        </div>

        <Separator className="my-8 bg-white/[0.06]" />

        {/* ── Bottom bar ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground/60">
          <span>
            © {year} {tCommon("siteName")}. {tFooter("rights")}
          </span>
          <span className="flex items-center gap-1">
            {tFooter("builtWith")}
          </span>
        </div>
      </div>
    </footer>
  );
}
