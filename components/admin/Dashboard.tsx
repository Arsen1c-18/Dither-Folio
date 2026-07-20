"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/store";
import { IdentityTab } from "@/components/admin/tabs/IdentityTab";
import { ThemeTab } from "@/components/admin/tabs/ThemeTab";
import { FxTab } from "@/components/admin/tabs/FxTab";
import { ContentTab } from "@/components/admin/tabs/ContentTab";
import { LibraryTab } from "@/components/admin/tabs/LibraryTab";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "identity", label: "Identity", Comp: IdentityTab },
  { id: "theme", label: "Theme", Comp: ThemeTab },
  { id: "fx", label: "Background / FX", Comp: FxTab },
  { id: "content", label: "Content", Comp: ContentTab },
  { id: "library", label: "Library", Comp: LibraryTab },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Dashboard() {
  const [tab, setTab] = useState<TabId>("identity");
  const data = useAdmin((s) => s.data);
  const dirty = useAdmin((s) => s.dirty);
  const saving = useAdmin((s) => s.saving);
  const setSaving = useAdmin((s) => s.setSaving);
  const markSaved = useAdmin((s) => s.markSaved);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const Active = TABS.find((t) => t.id === tab)!.Comp;

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        markSaved();
        setMsg({ ok: true, text: "Saved to data/portfolio.json — reload the site to see changes." });
      } else {
        const d = await res.json().catch(() => ({}));
        setMsg({ ok: false, text: d.error ?? "Save failed" });
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="label-system text-[var(--color-accent)]">Command centre</span>
            {dirty && <span className="text-xs text-[var(--color-subtle)]">• unsaved changes</span>}
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="rounded-lg border border-[var(--color-border-strong)] px-3 py-2 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
              View site ↗︎
            </a>
            <button onClick={logout} className="rounded-lg border border-[var(--color-border-strong)] px-3 py-2 text-xs text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
              Lock
            </button>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)] disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors",
                tab === t.id
                  ? "border-[var(--color-accent)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-subtle)] hover:text-[var(--color-muted)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {msg && (
        <div className="mx-auto max-w-4xl px-6 pt-4">
          <p
            className={cn(
              "rounded-lg border px-4 py-2.5 text-xs",
              msg.ok
                ? "border-[var(--color-online)]/40 text-[var(--color-online)]"
                : "border-[var(--color-accent)]/40 text-[var(--color-accent)]",
            )}
          >
            {msg.text}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 py-6">
        <Active />
      </main>
    </div>
  );
}
