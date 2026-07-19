"use client";

import { useEffect } from "react";
import { useAdmin } from "@/components/admin/store";
import { Group, ColorField, Slider } from "@/components/admin/fields";

/**
 * Theme tab — the full site palette. Accent is always saved; the extended
 * colours are optional overrides of the globals.css defaults (cleared =
 * back to default). Everything is applied to the live document root so the
 * whole dashboard previews instantly.
 */

// Defaults mirrored from globals.css :root — used for previews and reset
const PALETTE_DEFAULTS = {
  bg: "#050505",
  surface: "#0a0a0a",
  surface2: "#0f0f0f",
  elevated: "#141414",
  foreground: "#f5f5f5",
  muted: "#a1a1a1",
  subtle: "#6b6b6b",
  faint: "#3a3a3a",
  online: "#4ade80",
} as const;

type PaletteKey = keyof typeof PALETTE_DEFAULTS;

const PALETTE_FIELDS: { key: PaletteKey; label: string; cssVar: string; hint?: string }[] = [
  { key: "bg", label: "Background", cssVar: "--color-bg" },
  { key: "surface", label: "Surface", cssVar: "--color-surface", hint: "Cards, panels" },
  { key: "surface2", label: "Surface 2", cssVar: "--color-surface-2", hint: "Inset fields" },
  { key: "elevated", label: "Elevated", cssVar: "--color-elevated" },
  { key: "foreground", label: "Foreground", cssVar: "--color-foreground", hint: "Main text" },
  { key: "muted", label: "Muted", cssVar: "--color-muted", hint: "Body text" },
  { key: "subtle", label: "Subtle", cssVar: "--color-subtle", hint: "Labels, captions" },
  { key: "faint", label: "Faint", cssVar: "--color-faint", hint: "Ghost marks" },
  { key: "online", label: "Online dot", cssVar: "--color-online", hint: "Availability green" },
];

export function ThemeTab() {
  const { data, update } = useAdmin();
  const { theme } = data;

  // Live preview: push the whole working palette onto the document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-accent-bright", theme.accentBright);
    root.style.setProperty("--color-accent-dim", theme.accentDim);
    for (const f of PALETTE_FIELDS) {
      const v = theme[f.key];
      if (v) root.style.setProperty(f.cssVar, v);
      else root.style.removeProperty(f.cssVar);
    }
    if (theme.borderOpacity != null)
      root.style.setProperty("--color-border", `rgba(255,255,255,${theme.borderOpacity})`);
    if (theme.borderStrongOpacity != null)
      root.style.setProperty("--color-border-strong", `rgba(255,255,255,${theme.borderStrongOpacity})`);
  }, [theme]);

  return (
    <div className="flex flex-col gap-5">
      <Group title="Accent">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorField label="Accent" value={theme.accent} onChange={(v) => update((d) => { d.theme.accent = v; })} />
          <ColorField label="Accent bright" value={theme.accentBright} onChange={(v) => update((d) => { d.theme.accentBright = v; })} />
          <ColorField label="Accent dim" value={theme.accentDim} onChange={(v) => update((d) => { d.theme.accentDim = v; })} />
        </div>
      </Group>

      <Group title="Palette">
        <p className="text-xs text-[var(--color-subtle)]">
          Site-wide colour tokens. These override the built-in dark palette —
          use the ↺ on a field to return it to the default.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PALETTE_FIELDS.map((f) => (
            <div key={f.key} className="flex items-end gap-2">
              <div className="flex-1">
                <ColorField
                  label={f.label}
                  value={theme[f.key] ?? PALETTE_DEFAULTS[f.key]}
                  onChange={(v) => update((d) => { d.theme[f.key] = v; })}
                />
              </div>
              {theme[f.key] && (
                <button
                  type="button"
                  title="Reset to default"
                  onClick={() => update((d) => { delete d.theme[f.key]; })}
                  className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] text-xs text-[var(--color-subtle)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  ↺
                </button>
              )}
            </div>
          ))}
        </div>
      </Group>

      <Group title="Borders">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Slider
            label="Border opacity"
            value={theme.borderOpacity ?? 0.08}
            min={0}
            max={0.5}
            step={0.01}
            onChange={(v) => update((d) => { d.theme.borderOpacity = v; })}
          />
          <Slider
            label="Strong border opacity"
            value={theme.borderStrongOpacity ?? 0.14}
            min={0}
            max={0.6}
            step={0.01}
            onChange={(v) => update((d) => { d.theme.borderStrongOpacity = v; })}
          />
        </div>
      </Group>

      <Group title="Preview">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <span className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[#050505]">Primary button</span>
          <span className="rounded-full border border-[var(--color-accent)] px-4 py-2 text-xs text-[var(--color-accent)]">Outline</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="inline-block size-1.5 rounded-full bg-[var(--color-online)]" /> online dot
          </span>
          <span className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-foreground)]">
            Surface card <span className="text-[var(--color-muted)]">muted</span>{" "}
            <span className="text-[var(--color-subtle)]">subtle</span>{" "}
            <span className="text-[var(--color-faint)]">faint</span>
          </span>
        </div>
      </Group>
    </div>
  );
}
