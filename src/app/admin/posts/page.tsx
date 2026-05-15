import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { PostsTable } from "./posts-table";

export const metadata: Metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  await requireAdminSession();

  // Fetch all posts, grouped by translationGroupId
  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      locale: true,
      translationGroupId: true,
      category: true,
      published: true,
      publishedAt: true,
      readingTime: true,
      translationStatus: true,
    },
  });

  // Group by translationGroupId
  const groups = new Map<string, typeof posts>();
  for (const post of posts) {
    const group = groups.get(post.translationGroupId) ?? [];
    group.push(post);
    groups.set(post.translationGroupId, group);
  }

  const groupList = Array.from(groups.entries()).map(([groupId, versions]) => ({
    groupId,
    versions,
  }));

  return (
    <div className="px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Posts</h1>
          <p className="mt-1 text-sm text-white/40">{groupList.length} posts cadastrados</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Novo post
        </Link>
      </div>

      <PostsTable groups={groupList} />
    </div>
  );
}
