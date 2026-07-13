import { NextResponse } from "next/server";
import { SESSION_COOKIE, getPasscode } from "@/lib/auth";

/** Exchange a passcode for a session cookie. Dev-only (dashboard is hidden in prod). */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const passcode = getPasscode();
  if (!passcode) {
    return NextResponse.json(
      { error: "ADMIN_PASSCODE is not set. Add it to .env.local." },
      { status: 500 },
    );
  }

  let body: { passcode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.passcode !== passcode) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, passcode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return res;
}
