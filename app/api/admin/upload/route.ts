import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";

/**
 * Upload a project image to public/projects/. Dev-only, like /api/admin/save:
 * the filesystem is read-only on Vercel, so locally you upload → save →
 * commit → push → redeploy (the image is committed with the repo).
 *
 * Accepts multipart/form-data with `file` and `projectId`; the file is
 * stored as /projects/{projectId}{ext} and that public path is returned.
 */

const ALLOWED = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);
const MAX_BYTES = 8 * 1024 * 1024;

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
  const projectId = form?.get("projectId");

  if (!(file instanceof File) || typeof projectId !== "string" || !projectId) {
    return NextResponse.json({ error: "Expected `file` and `projectId`" }, { status: 400 });
  }
  // The id becomes a filename — keep it to safe characters
  if (!/^[a-zA-Z0-9_-]+$/.test(projectId)) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
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
    const dir = path.join(process.cwd(), "public", "projects");
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, `${projectId}${ext}`), bytes);
    return NextResponse.json({ ok: true, path: `/projects/${projectId}${ext}` });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write file", detail: String(err) },
      { status: 500 },
    );
  }
}
