import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0a0a0f] text-[#e2e8f0] antialiased">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "border-white/[0.08] bg-[#111118] text-white",
              description: "text-white/60",
            },
          }}
        />
      </body>
    </html>
  );
}
