import { db } from "@/lib/db";
import { PostEditor } from "@/components/studio/PostEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "New article" };

export default async function NewPostPage() {
  const [categories, authors] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return <PostEditor post={null} categories={categories} authors={authors} />;
}
