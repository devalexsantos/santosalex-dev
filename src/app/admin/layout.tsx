import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0a0f] text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
