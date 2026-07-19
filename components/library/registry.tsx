"use client";

import { RadialNav } from "@/components/layout/RadialNav";
import { RadialNavClassic } from "@/components/layout/RadialNavClassic";
import { RadialNavGlow } from "@/components/layout/RadialNavGlow";
import { RadialNavOrrery } from "@/components/layout/RadialNavOrrery";
import { HUB_LIBRARY, type HubLibraryEntry, type LibraryVibe } from "@/components/library/hubRegistry";
import type { UiConfig } from "@/types";

export type LibrarySlot = "navbar-pets" | "radial-navbar";

type SlotConfig = {
  label: string;
  selectionKey: keyof UiConfig;
  defaultId: string;
  actionLabel: string;
  activeLabel: string;
};

/** Add a new slot here, then add entries with that slot — the dashboard wiring follows automatically. */
export const SLOT_CONFIG: Record<LibrarySlot, SlotConfig> = {
  "navbar-pets": {
    label: "Navbar pets",
    selectionKey: "navbarBot",
    defaultId: "radial-bot",
    actionLabel: "Use in navbar",
    activeLabel: "Live in navbar",
  },
  "radial-navbar": {
    label: "Radial navbar designs",
    selectionKey: "radialNavbar",
    defaultId: "radial-nav",
    actionLabel: "Use this radial nav",
    activeLabel: "Live radial nav",
  },
};

export const SLOT_LABELS: Record<LibrarySlot, string> = Object.fromEntries(
  Object.entries(SLOT_CONFIG).map(([slot, config]) => [slot, config.label]),
) as Record<LibrarySlot, string>;

export type LibraryEntry = HubLibraryEntry | {
  id: string;
  name: string;
  vibe: LibraryVibe;
  file: string;
  description: string;
  slot: "radial-navbar";
  stageClass?: string;
  render: () => React.ReactNode;
  renderLive: (className?: string) => React.ReactNode;
};

const radialPreviewClass = "relative size-[min(72vw,32rem)]";

export const LIBRARY: LibraryEntry[] = [
  ...HUB_LIBRARY,
  {
    id: "radial-nav", name: "Kinetic Radial", vibe: "techy", file: "components/layout/RadialNav.tsx",
    description: "Current radial navbar: calibrated telemetry rings with a quiet kinetic center.", slot: "radial-navbar", stageClass: "min-h-[34rem] overflow-hidden",
    render: () => <RadialNav className={radialPreviewClass} preview />,
    renderLive: (className) => <RadialNav className={className} />,
  },
  {
    id: "radial-nav-classic", name: "Classic Dial", vibe: "aesthetic", file: "components/layout/RadialNavClassic.tsx",
    description: "The original quiet instrument with hairline rings and calibrated graduations.", slot: "radial-navbar", stageClass: "min-h-[34rem] overflow-hidden",
    render: () => <RadialNavClassic className={radialPreviewClass} preview />,
    renderLive: (className) => <RadialNavClassic className={className} />,
  },
  {
    id: "radial-nav-glow", name: "Glow Dial", vibe: "techy", file: "components/layout/RadialNavGlow.tsx",
    description: "Accent-lit dial with a conic energy sweep and illuminated hub.", slot: "radial-navbar", stageClass: "min-h-[34rem] overflow-hidden",
    render: () => <RadialNavGlow className={radialPreviewClass} preview />,
    renderLive: (className) => <RadialNavGlow className={className} />,
  },
  {
    id: "radial-nav-orrery", name: "Orrery", vibe: "aesthetic", file: "components/layout/RadialNavOrrery.tsx",
    description: "Segmented orbital navigation with moons, crosshairs, and a sweeping survey sector.", slot: "radial-navbar", stageClass: "min-h-[34rem] overflow-hidden",
    render: () => <RadialNavOrrery className={radialPreviewClass} preview />,
    renderLive: (className) => <RadialNavOrrery className={className} />,
  },
];

export function getLibraryEntry(id: string): LibraryEntry | undefined {
  return LIBRARY.find((entry) => entry.id === id);
}

export function getSlotSelection(ui: UiConfig | undefined, slot: LibrarySlot): string {
  const config = SLOT_CONFIG[slot];
  return ui?.[config.selectionKey] ?? config.defaultId;
}

export function setSlotSelection(
  ui: UiConfig | undefined,
  slot: LibrarySlot,
  id: string,
): UiConfig {
  return { ...ui, [SLOT_CONFIG[slot].selectionKey]: id } as UiConfig;
}
