import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Novo post" };

export default async function NewPostPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <Link
          href="/admin/posts"
          className="mb-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/60"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Posts
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Novo post</h1>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <PostForm defaultValues={{}} groupId={null} />
      </div>
    </div>
  );
}
