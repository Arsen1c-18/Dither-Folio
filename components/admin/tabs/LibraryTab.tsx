"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/store";
import {
  LIBRARY,
  SLOT_CONFIG,
  type LibraryEntry,
  type LibrarySlot,
  getSlotSelection,
  setSlotSelection,
} from "@/components/library/registry";
import { cn } from "@/lib/utils";

const VIBES = ["all", "cute", "techy", "aesthetic"] as const;
type Vibe = (typeof VIBES)[number];
const CATEGORY_TABS = ["all", "navbar-pets", "radial-navbar"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

const VIBE_COLOR: Record<LibraryEntry["vibe"], string> = {
  cute: "text-[var(--color-online)]",
  techy: "text-[var(--color-accent)]",
  aesthetic: "text-[var(--color-muted)]",
};

const SLOTS = Object.keys(SLOT_CONFIG) as LibrarySlot[];

/**
 * Library tab — browsable gallery of every element we've built, shipped or
 * shelved, grouped by the site slot they plug into. Selecting one makes it
 * live in that slot; the choice persists to data/portfolio.json via Save.
 */
export function LibraryTab() {
  const { data, update } = useAdmin();
  const [vibe, setVibe] = useState<Vibe>("all");
  const [category, setCategory] = useState<CategoryTab>("all");

  return (
    <div className="flex flex-col gap-6">
      {/* Vibe filter */}
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => (
          <button
            key={v}
            onClick={() => setVibe(v)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-all",
              vibe === v
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#050505]"
                : "border-[var(--color-border-strong)] text-[var(--color-muted)] hover:border-[var(--color-foreground)]",
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Component categories stay separate from visual mood filters. */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-4">
        {CATEGORY_TABS.map((tab) => {
          const label = tab === "all" ? "All library" : SLOT_CONFIG[tab].label;
          return (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs transition-colors",
                category === tab
                  ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]"
                  : "text-[var(--color-subtle)] hover:text-[var(--color-muted)]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[var(--color-subtle)]">
        Every element we build lives here — shipped or shelved. Pick one per slot to make it live
        on the site; hit Save to persist.
      </p>

      {SLOTS.map((slot) => {
        if (category !== "all" && category !== slot) return null;
        const slotConfig = SLOT_CONFIG[slot];
        const activeId = getSlotSelection(data.ui, slot);
        const entries = LIBRARY.filter(
          (e) => e.slot === slot && (vibe === "all" || e.vibe === vibe),
        );
        if (entries.length === 0) return null;

        return (
          <div key={slot} className="flex flex-col gap-4">
            {/* Slot header */}
            <div className="flex items-center gap-3">
              <h2 className="label-system text-[var(--color-accent)]">{slotConfig.label}</h2>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="font-mono text-[0.6rem] text-[var(--color-subtle)]">
                {entries.length} element{entries.length === 1 ? "" : "s"}
              </span>
            </div>

            {entries.map((e) => {
              const isActive = e.id === activeId;
              return (
                <section
                  key={e.id}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border bg-[var(--color-surface-2)] transition-colors",
                    isActive ? "border-[var(--color-accent)]" : "border-[var(--color-border)]",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-3.5">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-sm font-medium text-[var(--color-foreground)]">{e.name}</h3>
                      <span className={cn("label-system text-[0.6rem]", VIBE_COLOR[e.vibe])}>{e.vibe}</span>
                      {isActive && (
                        <span className="label-system text-[0.6rem] text-[var(--color-accent)]">● {slotConfig.activeLabel}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-[0.65rem] text-[var(--color-subtle)]">{e.file}</code>
                      <button
                        onClick={() => update((d) => { d.ui = setSlotSelection(d.ui, slot, e.id); })}
                        disabled={isActive}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs transition-colors",
                          isActive
                            ? "cursor-default border-[var(--color-accent)] text-[var(--color-accent)]"
                            : "border-[var(--color-border-strong)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]",
                        )}
                      >
                        {isActive ? slotConfig.activeLabel : slotConfig.actionLabel}
                      </button>
                    </div>
                  </div>

                  {/* Preview stage */}
                  <div className={cn("grid place-items-center bg-[var(--color-bg)] p-10", e.stageClass)}>
                    {e.render()}
                  </div>

                  <p className="border-t border-[var(--color-border)] px-5 py-3 text-xs leading-relaxed text-[var(--color-muted)]">
                    {e.description}
                  </p>
                </section>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
