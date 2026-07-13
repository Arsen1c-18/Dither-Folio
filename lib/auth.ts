import { cookies } from "next/headers";

/**
 * Minimal single-user auth for the dev-only dashboard.
 *
 * The dashboard never ships to production (see app/admin), so this is a light
 * gate rather than a hardened auth system: a passcode from ADMIN_PASSCODE is
 * exchanged for an httpOnly session cookie holding the same secret.
 */

export const SESSION_COOKIE = "admin_session";

/** The configured passcode, or null if unset (dashboard then stays locked). */
export function getPasscode(): string | null {
  const pass = process.env.ADMIN_PASSCODE;
  return pass && pass.length > 0 ? pass : null;
}

/** True when the current request carries a valid session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  const passcode = getPasscode();
  if (!passcode) return false;
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === passcode;
}
