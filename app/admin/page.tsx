import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAuthenticated, getPasscode } from "@/lib/auth";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Dev-only command centre. Hidden entirely in production (the filesystem is
 * read-only on Vercel, so edits happen locally then get committed + redeployed).
 */
export default async function AdminPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const authed = await isAuthenticated();
  return <AdminApp authed={authed} passcodeSet={getPasscode() !== null} />;
}
