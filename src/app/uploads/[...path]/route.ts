import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";

import { safeUploadPath, contentTypeFor } from "@/lib/uploads";

export const runtime = "nodejs";
// Filenames are UUIDs, so a stored file never changes — but the route itself
// must stay dynamic so newly uploaded media is served without a rebuild.
export const dynamic = "force-dynamic";

/**
 * Serves media uploaded through the Studio.
 *
 * Streamed from disk rather than read into memory, so a large image does not
 * cost a full buffer per request.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  const filePath = safeUploadPath(segments ?? []);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = contentTypeFor(filePath);
  if (!contentType) {
    // Only image types are ever written here; refuse to serve anything else.
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        // The name is a UUID; the bytes behind it never change.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
