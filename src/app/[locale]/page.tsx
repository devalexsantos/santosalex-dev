import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tFooter = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  return (
    <>
      <main className="relative flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
          <div className="absolute bottom-0 right-1/3 h-[360px] w-[600px] rounded-full bg-accent/10 blur-[140px]" />
        </div>

        <section className="mx-auto flex max-w-4xl flex-col items-start gap-8 px-6 py-32 sm:py-40">
          <Badge variant="outline" className="border-primary/40 text-primary">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t("subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" disabled>
              {t("ctaProjects")}
            </Button>
            <Button size="lg" variant="outline" disabled>
              {t("ctaChat")}
            </Button>
            <Button size="lg" variant="ghost" disabled>
              {t("ctaContact")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{t("soon")}</p>
        </section>
      </main>
      <footer className="border-t border-border/60 px-6 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {tCommon("siteName")}
          </span>
          <span>{tFooter("rights")}</span>
        </div>
      </footer>
    </>
  );
}
