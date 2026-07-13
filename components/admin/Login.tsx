"use client";

import { useState } from "react";

/** Passcode gate for the dashboard. */
export function Login({
  passcodeSet,
  onSuccess,
}: {
  passcodeSet: boolean;
  onSuccess: () => void;
}) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-7"
      >
        <div className="flex flex-col gap-1">
          <span className="label-system text-[var(--color-accent)]">Command centre</span>
          <h1 className="font-display text-xl font-medium">Dashboard access</h1>
        </div>

        {!passcodeSet && (
          <p className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted)]">
            <code>ADMIN_PASSCODE</code> is not set. Add it to <code>.env.local</code> and restart the dev server.
          </p>
        )}

        <input
          type="password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />

        {error && <p className="text-xs text-[var(--color-accent)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || !passcodeSet}
          className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)] disabled:opacity-40"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
