import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Image upload for the Studio.
 *
 * Files land in the runtime storage directory (see lib/uploads.ts) and are
 * served back by the `/uploads/[...path]` route. They deliberately do not go
 * into `public/`, whose contents Next.js indexes at build time — anything
 * written there after a build is served as a 404.
 *
 * On a serverless host (Vercel, Netlify Functions) the filesystem is read-only
 * and ephemeral — swap this handler for an S3/R2/Blob put and return the public
 * URL. Nothing else in the app needs to change; it only consumes `url`.
 */

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, AVIF and GIF images are allowed." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.` },
      { status: 413 },
    );
  }

  // Generated name: the original could collide, or carry a path traversal.
  const filename = `${randomUUID()}.${extension}`;
  const directory = UPLOAD_DIR;

  try {
    await mkdir(directory, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(join(directory, filename), bytes);
  } catch (err) {
    console.error("[upload] write failed", err);
    return NextResponse.json(
      { error: "Could not save the file on the server." },
      { status: 500 },
    );
  }

  const url = `/uploads/${filename}`;

  // Recorded so the media can be listed and cleaned up later.
  try {
    await db.media.create({
      data: { url, filename, mime: file.type, size: file.size },
    });
  } catch (err) {
    // The file is on disk and usable; a missing index row is not worth failing.
    console.error("[upload] media row failed", err);
  }

  return NextResponse.json({ url, filename, size: file.size });
}
