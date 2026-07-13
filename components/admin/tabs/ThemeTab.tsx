"use client";

import { useEffect } from "react";
import { useAdmin } from "@/components/admin/store";
import { Group, ColorField } from "@/components/admin/fields";

/**
 * Theme tab — accent colors. Applies the working accent to the live document
 * root so the whole dashboard (and its accent-tokened UI) previews instantly.
 */
export function ThemeTab() {
  const { data, update } = useAdmin();
  const { theme } = data;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-accent-bright", theme.accentBright);
    root.style.setProperty("--color-accent-dim", theme.accentDim);
  }, [theme.accent, theme.accentBright, theme.accentDim]);

  return (
    <div className="flex flex-col gap-5">
      <Group title="Accent">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField label="Accent" value={theme.accent} onChange={(v) => update((d) => { d.theme.accent = v; })} />
          <ColorField label="Accent bright" value={theme.accentBright} onChange={(v) => update((d) => { d.theme.accentBright = v; })} />
          <ColorField label="Accent dim" value={theme.accentDim} onChange={(v) => update((d) => { d.theme.accentDim = v; })} />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[#050505]">Primary button</span>
          <span className="rounded-full border border-[var(--color-accent)] px-4 py-2 text-xs text-[var(--color-accent)]">Outline</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="inline-block size-1.5 rounded-full bg-[var(--color-accent)]" /> accent dot
          </span>
        </div>
      </Group>
    </div>
  );
}
