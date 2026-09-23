import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PostEditor } from "@/components/studio/PostEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `Edit — ${post.title}` : "Edit article" };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, categories, authors] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { tags: { select: { name: true } } } }),
    db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!post) notFound();

  return <PostEditor post={post} categories={categories} authors={authors} />;
}
