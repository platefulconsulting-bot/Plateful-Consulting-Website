import { join, normalize, resolve, extname, sep } from "node:path";

/**
 * Upload storage.
 *
 * Files are deliberately NOT written into `public/`. Next.js builds its static
 * file manifest from `public/` at build time, so anything added afterwards is
 * served as a 404 until the next deploy — which would silently break every
 * image an editor uploads. Instead uploads live in a runtime storage directory
 * and are served by the route handler at `/uploads/[...path]`.
 *
 * Point UPLOAD_DIR at a mounted volume when running in a container so the
 * media survives a redeploy.
 */

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? resolve(process.env.UPLOAD_DIR)
  : join(process.cwd(), "storage", "uploads");

export const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

/** Extension -> MIME, or null when the type is not one we serve. */
export function contentTypeFor(filename: string) {
  return CONTENT_TYPES[extname(filename).toLowerCase()] ?? null;
}

/**
 * Resolves a request path inside the upload directory, refusing anything that
 * escapes it. `..`, absolute paths and encoded traversal all land outside the
 * root and are rejected.
 */
export function safeUploadPath(segments: string[]) {
  const relative = normalize(segments.join("/")).replace(/^([/\\])+/, "");
  const absolute = resolve(UPLOAD_DIR, relative);

  if (absolute !== UPLOAD_DIR && !absolute.startsWith(UPLOAD_DIR + sep)) {
    return null;
  }
  return absolute;
}
