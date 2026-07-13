import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";
import { portfolioSchema } from "@/lib/schema";

const DATA_PATH = path.join(process.cwd(), "data", "portfolio.json");

/**
 * Persist edited portfolio data to data/portfolio.json.
 *
 * Dev-only: the filesystem is read-only on Vercel, so this returns 404 in
 * production. Locally you edit → save → commit → push → redeploy.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Saving is disabled in production. Edit locally and redeploy." },
      { status: 404 },
    );
  }

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = portfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const json = JSON.stringify(parsed.data, null, 2) + "\n";
    await writeFile(DATA_PATH, json, "utf8");
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write file", detail: String(err) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
