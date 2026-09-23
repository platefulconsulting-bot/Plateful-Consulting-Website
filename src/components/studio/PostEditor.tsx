"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { RichTextEditor } from "./RichTextEditor";
import { savePostAction, deletePostAction } from "@/app/studio/actions";
import { slugify, cn } from "@/lib/utils";

type Option = { id: string; name: string };

export type EditablePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImage: string | null;
  coverAlt: string | null;
  categoryId: string | null;
  authorId: string | null;
  status: string;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: { name: string }[];
};

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

export function PostEditor({
  post,
  categories,
  authors,
}: {
  post: EditablePost | null;
  categories: Option[];
  authors: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.contentHtml ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [authorId, setAuthorId] = useState(post?.authorId ?? "");
  const [tags, setTags] = useState(post?.tags.map((t) => t.name).join(", ") ?? "");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");

  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const coverInput = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Slug follows the title until the editor overrides it by hand.
  const effectiveSlug = slugTouched ? slug : slugify(title);

  const stats = useMemo(() => {
    const text = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    return { words, minutes: Math.max(1, Math.round(words / 220)) };
  }, [contentHtml]);

  async function uploadCover(file: File) {
    setUploadingCover(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/studio/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Cover upload failed.");
        return;
      }
      setCoverImage(data.url);
    } catch {
      setError("Cover upload failed.");
    } finally {
      setUploadingCover(false);
    }
  }

  function save(status: "draft" | "published") {
    setError("");
    startTransition(async () => {
      const result = await savePostAction({
        id: post?.id,
        title,
        slug: effectiveSlug,
        excerpt,
        contentHtml,
        coverImage,
        coverAlt,
        categoryId,
        authorId,
        tags,
        status,
        featured,
        metaTitle,
        metaDescription,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));

      if (!post) {
        router.replace(`/studio/posts/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="p-6 lg:p-10">
      {/* --- Action bar --- */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="grid h-9 w-9 place-items-center rounded-lg border border-cream-100/12 text-cream-400 transition-colors hover:border-gold-400/50 hover:text-gold-300"
            aria-label="Back to articles"
          >
            <X className="h-4 w-4" aria-hidden />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-cream-50">
              {post ? "Edit article" : "New article"}
            </h1>
            <p className="text-xs text-cream-500">
              {stats.words.toLocaleString("en-IN")} words · ~{stats.minutes} min read
              {savedAt && (
                <span className="ml-2 text-basil-400">
                  <Check className="mr-1 inline h-3 w-3" aria-hidden />
                  saved {savedAt}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {post?.status === "published" && (
            <Link href={`/${post.slug}`} target="_blank" className="btn btn-outline btn-sm">
              <ExternalLink className="h-4 w-4" aria-hidden />
              View
            </Link>
          )}

          <button
            type="button"
            onClick={() => save("draft")}
            disabled={pending || !title}
            className="btn btn-outline btn-sm disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            Save draft
          </button>

          <button
            type="button"
            onClick={() => save("published")}
            disabled={pending || !title}
            className="btn btn-gold btn-sm disabled:opacity-50"
          >
            {post?.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-ember-500/30 bg-ember-500/10 p-3.5 text-sm text-ember-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {/* --- Body --- */}
      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <div>
            <label htmlFor="title" className={LABEL}>
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How to increase Zomato orders in 30 days"
              className={cn(FIELD, "mt-2 font-display text-lg font-semibold")}
            />
          </div>

          <div>
            <label htmlFor="slug" className={LABEL}>
              URL
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 focus-within:border-gold-400/60">
              <span className="shrink-0 text-sm text-cream-500">/</span>
              <input
                id="slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="how-to-increase-zomato-orders"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-cream-100 placeholder:text-cream-500 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-cream-500">
              Articles sit at the site root. Changing this on a published article breaks its
              existing links — only do it before publishing.
            </p>
          </div>

          <div>
            <span className={LABEL}>Article</span>
            <div className="mt-2">
              <RichTextEditor value={contentHtml} onChange={setContentHtml} />
            </div>
          </div>
        </div>

        {/* --- Sidebar --- */}
        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-sm font-semibold text-cream-50">Publishing</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="category" className={LABEL}>
                  Category
                </label>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={cn(FIELD, "mt-2")}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="author" className={LABEL}>
                  Author
                </label>
                <select id="author" value={authorId} onChange={(e) => setAuthorId(e.target.value)} className={cn(FIELD, "mt-2")}>
                  <option value="">No byline</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className={LABEL}>
                  Tags
                </label>
                <input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Swiggy, Ads, Margins"
                  className={cn(FIELD, "mt-2")}
                />
                <p className="mt-1.5 text-xs text-cream-500">Comma-separated.</p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cream-100/10 p-3.5">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#E0A82E]"
                />
                <span>
                  <span className="block text-sm font-medium text-cream-100">Feature this article</span>
                  <span className="block text-xs text-cream-500">
                    Shows in the hero slot on the blog and on the homepage.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-sm font-semibold text-cream-50">Cover image</h2>

            <div className="mt-4">
              {coverImage ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt="" className="aspect-[16/9] w-full rounded-lg object-cover" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => coverInput.current?.click()} className="btn btn-outline btn-sm flex-1">
                      Replace
                    </button>
                    <button type="button" onClick={() => setCoverImage("")} className="btn btn-ghost btn-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  disabled={uploadingCover}
                  className="grid aspect-[16/9] w-full place-items-center rounded-lg border border-dashed border-cream-100/20 text-cream-500 transition-colors hover:border-gold-400/50 hover:text-gold-300"
                >
                  {uploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-xs">
                      <ImagePlus className="h-6 w-6" aria-hidden />
                      Upload cover
                    </span>
                  )}
                </button>
              )}

              <input
                ref={coverInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCover(file);
                  e.target.value = "";
                }}
              />

              <p className="mt-3 text-xs text-cream-500">
                Optional. Without one, the article gets a generated cover in its category colour.
              </p>

              {coverImage && (
                <div className="mt-3">
                  <label htmlFor="coverAlt" className={LABEL}>
                    Image description
                  </label>
                  <input
                    id="coverAlt"
                    value={coverAlt}
                    onChange={(e) => setCoverAlt(e.target.value)}
                    placeholder="What the image shows"
                    className={cn(FIELD, "mt-2")}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-sm font-semibold text-cream-50">Search &amp; sharing</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="excerpt" className={LABEL}>
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="Leave empty to generate from the opening paragraph."
                  className={cn(FIELD, "mt-2 resize-y")}
                />
              </div>

              <div>
                <label htmlFor="metaTitle" className={LABEL}>
                  SEO title
                </label>
                <input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to the article title"
                  className={cn(FIELD, "mt-2")}
                />
                <p className={cn("mt-1.5 text-xs", metaTitle.length > 60 ? "text-saffron-400" : "text-cream-500")}>
                  {metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label htmlFor="metaDescription" className={LABEL}>
                  Meta description
                </label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  maxLength={320}
                  placeholder="Defaults to the excerpt"
                  className={cn(FIELD, "mt-2 resize-y")}
                />
                <p className={cn("mt-1.5 text-xs", metaDescription.length > 158 ? "text-saffron-400" : "text-cream-500")}>
                  {metaDescription.length}/158 characters
                </p>
              </div>
            </div>
          </section>

          {post && (
            <section className="card border-ember-500/25 p-5">
              <h2 className="font-display text-sm font-semibold text-cream-50">Danger zone</h2>
              <p className="mt-2 text-xs leading-relaxed text-cream-500">
                Deleting is permanent. If this article is indexed, consider unpublishing it
                instead so the URL can be redirected.
              </p>

              <form
                action={deletePostAction.bind(null, post.id)}
                onSubmit={(e) => {
                  if (!window.confirm(`Delete “${post.title}” permanently?`)) e.preventDefault();
                }}
                className="mt-4"
              >
                <button type="submit" className="btn btn-outline btn-sm w-full border-ember-500/40 text-ember-300 hover:border-ember-400 hover:text-ember-300">
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete article
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
