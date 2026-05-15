"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projetos",  icon: FolderKanban },
  { href: "/admin/posts",    label: "Posts",     icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#080810]">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-white/[0.06] px-5">
        <Link href="/admin" className="text-sm font-semibold text-white/80 tracking-tight">
          santosalex <span className="text-white/30">/</span>{" "}
          <span className="text-violet-400">admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] p-2">
        <form action="/admin/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
