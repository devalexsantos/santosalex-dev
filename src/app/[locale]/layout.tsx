import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site";
import {
  jsonLdScriptProps,
  personSchema,
  webSiteSchema,
} from "@/lib/structured-data";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PortfolioChatTrigger } from "@/components/chat/portfolio-chat-trigger";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("siteName"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("tagline"),
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: locale === "pt-BR" ? "pt_BR" : "en_US",
      alternateLocale: locale === "pt-BR" ? ["en_US"] : ["pt_BR"],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const person = personSchema({
    name: tCommon("siteName"),
    jobTitle: locale === "pt-BR" ? "Desenvolvedor Fullstack" : "Fullstack Developer",
    description: tCommon("tagline"),
    locale,
  });
  const website = webSiteSchema({ name: tCommon("siteName"), locale });

  return (
    <html
      lang={locale}
      className={`dark ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script {...jsonLdScriptProps(person)} />
        <script {...jsonLdScriptProps(website)} />
        <NextIntlClientProvider>
          <Navbar />
          <main className="relative flex-1 pt-16">{children}</main>
          <Footer />
          <PortfolioChatTrigger />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
