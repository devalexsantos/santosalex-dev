import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
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
    </>
  );
}
