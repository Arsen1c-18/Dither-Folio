import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";

/**
 * Upload an image for the dev-only admin dashboard, like /api/admin/save:
 * the filesystem is read-only on Vercel, so locally you upload → save →
 * commit → push → redeploy (the image is committed with the repo).
 *
 * Accepts multipart/form-data with `file`, `kind` ("project" | "experience",
 * default "project") and the record's id — `projectId` for projects, `id` for
 * experience records. The file is stored as /{kind}/{id}{ext} under public/
 * and that public path is returned.
 */

const ALLOWED = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
const MAX_BYTES = 8 * 1024 * 1024;
/* kind → the subdirectory under public/ the file is written to */
const KIND_DIR = new Map([
  ["project", "projects"],
  ["experience", "experience"],
]);

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Uploads are disabled in production. Add images locally and redeploy." },
      { status: 404 },
    );
  }

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = typeof form?.get("kind") === "string" ? String(form.get("kind")) : "project";
  const id = typeof form?.get("id") === "string" ? String(form.get("id")) : String(form?.get("projectId") ?? "");

  if (!(file instanceof File) || !id) {
    return NextResponse.json({ error: "Expected `file` and the record id" }, { status: 400 });
  }
  // The id becomes a filename — keep it to safe characters
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const dirName = KIND_DIR.get(kind);
  if (!dirName) {
    return NextResponse.json({ error: `Unknown kind \`${kind}\`` }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported type ${file.type} — use PNG, JPEG, WebP, or AVIF` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  }

  try {
    const dir = path.join(process.cwd(), "public", dirName);
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, `${id}${ext}`), bytes);
    return NextResponse.json({ ok: true, path: `/${dirName}/${id}${ext}` });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write file", detail: String(err) },
      { status: 500 },
    );
  }
}
