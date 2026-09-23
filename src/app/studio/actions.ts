"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { createSession, destroySession, verifyCredentials, getSession } from "@/lib/auth";
import { sanitizeArticle, htmlToText } from "@/lib/sanitize";
import { slugify, estimateReadingMinutes, truncate } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

/* ------------------------------------------------------------------------- */
/* Auth                                                                       */
/* ------------------------------------------------------------------------- */

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/studio");

  if (!email || !password) return { error: "Enter your email and password." };

  // Throttle by account, so one address cannot be brute-forced.
  const limit = rateLimit(`login:${email.toLowerCase()}`, { limit: 8, windowMs: 15 * 60_000 });
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }

  const user = await verifyCredentials(email, password);
  if (!user) return { error: "That email and password do not match." };

  await createSession(user);

  // Only allow internal redirects — never bounce to an attacker-supplied host.
  redirect(next.startsWith("/studio") ? next : "/studio");
}

export async function logoutAction() {
  await destroySession();
  redirect("/studio/login");
}

/* ------------------------------------------------------------------------- */
/* Posts                                                                      */
/* ------------------------------------------------------------------------- */

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(4, "Give the article a title.").max(200),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(400).optional(),
  contentHtml: z.string().default(""),
  coverImage: z.string().trim().max(500).optional(),
  coverAlt: z.string().trim().max(300).optional(),
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  metaTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(320).optional(),
});

export type SavePostInput = z.input<typeof postSchema>;
export type SavePostResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

/** Ensures the slug is unique, appending -2, -3 … when it is not. */
async function uniqueSlug(base: string, currentId?: string) {
  let slug = base || "untitled";
  let n = 2;
  // Bounded: a title colliding 50 times is a data problem, not a loop.
  for (let i = 0; i < 50; i++) {
    const clash = await db.post.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === currentId) return slug;
    slug = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

export async function savePostAction(input: SavePostInput): Promise<SavePostResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Your session expired. Please sign in again." };

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }
  const data = parsed.data;

  // Never trust editor HTML: it reaches readers via dangerouslySetInnerHTML.
  const contentHtml = sanitizeArticle(data.contentHtml);
  const plain = htmlToText(contentHtml);

  const existing = data.id
    ? await db.post.findUnique({ where: { id: data.id }, select: { id: true, slug: true, publishedAt: true } })
    : null;

  if (data.id && !existing) return { ok: false, error: "That article no longer exists." };

  const slug = await uniqueSlug(slugify(data.slug || data.title), existing?.id);
  const excerpt = data.excerpt?.trim() || truncate(plain, 200);

  // Tags: split, dedupe, upsert, then connect.
  const tagNames = (data.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  const tagIds: { id: string }[] = [];
  for (const name of [...new Set(tagNames)]) {
    const tag = await db.tag.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { slug: slugify(name), name },
    });
    tagIds.push({ id: tag.id });
  }

  const publishing = data.status === "published";

  const payload = {
    title: data.title.trim(),
    slug,
    excerpt,
    contentHtml,
    coverImage: data.coverImage?.trim() || null,
    coverAlt: data.coverAlt?.trim() || null,
    categoryId: data.categoryId || null,
    authorId: data.authorId || null,
    status: data.status,
    featured: data.featured,
    // Marks this post as hand-authored so `npm run db:seed` leaves it alone.
    editedInStudio: true,
    readingMinutes: estimateReadingMinutes(contentHtml),
    metaTitle: data.metaTitle?.trim() || null,
    metaDescription: data.metaDescription?.trim() || null,
    // Set the publish date the first time it goes live, and keep it after that.
    publishedAt: publishing ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
  };

  let saved;
  try {
    saved = existing
      ? await db.post.update({
          where: { id: existing.id },
          data: { ...payload, tags: { set: tagIds } },
        })
      : await db.post.create({
          data: { ...payload, tags: { connect: tagIds } },
        });
  } catch (err) {
    console.error("[studio] save failed", err);
    return { ok: false, error: "Could not save. Please try again." };
  }

  // Refresh everything the change could appear on.
  revalidatePath("/", "layout");
  revalidatePath("/blogs");
  revalidatePath(`/${saved.slug}`);
  if (existing && existing.slug !== saved.slug) revalidatePath(`/${existing.slug}`);
  revalidatePath("/sitemap.xml");

  return { ok: true, id: saved.id, slug: saved.slug };
}

export async function deletePostAction(id: string) {
  const session = await getSession();
  if (!session) redirect("/studio/login");

  const post = await db.post.findUnique({ where: { id }, select: { slug: true } });
  if (!post) return;

  await db.post.delete({ where: { id } });

  revalidatePath("/", "layout");
  revalidatePath("/blogs");
  revalidatePath(`/${post.slug}`);
  revalidatePath("/sitemap.xml");

  redirect("/studio");
}

/* ------------------------------------------------------------------------- */
/* Enquiries                                                                  */
/* ------------------------------------------------------------------------- */

export async function toggleEnquiryHandled(id: string, handled: boolean) {
  const session = await getSession();
  if (!session) redirect("/studio/login");

  await db.enquiry.update({ where: { id }, data: { handled } });
  revalidatePath("/studio/enquiries");
}
