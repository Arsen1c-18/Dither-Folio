"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/store";
import { Group, Slider, Toggle, ColorField } from "@/components/admin/fields";
import { rgb01ToHex, hexToRgb01 } from "@/components/admin/color";
import { DitherBackground } from "@/components/fx/DitherBackground";
import type { FxPresetName } from "@/types";
import { cn } from "@/lib/utils";

const PRESETS: { name: FxPresetName; label: string }[] = [
  { name: "hero", label: "Hero" },
  { name: "panel", label: "Panel" },
  { name: "strip", label: "Strip" },
];

/** Background / FX tab — live-tune each dither preset with an inline preview. */
export function FxTab() {
  const { data, update } = useAdmin();
  const [active, setActive] = useState<FxPresetName>("hero");
  const preset = data.fx[active];

  return (
    <div className="flex flex-col gap-5">
      {/* Preset switcher */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setActive(p.name)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-all",
              active === p.name
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[#050505]"
                : "border-[var(--color-border-strong)] text-[var(--color-muted)] hover:border-[var(--color-foreground)]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div className="relative h-48 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <DitherBackground key={active} preset={active} {...preset} overlay={0.15} />
      </div>

      <Group title={`${active} preset`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Slider label="Wave speed" value={preset.waveSpeed} min={0} max={0.5} step={0.005} onChange={(v) => update((d) => { d.fx[active].waveSpeed = v; })} />
          <Slider label="Wave frequency" value={preset.waveFrequency} min={0} max={10} step={0.1} onChange={(v) => update((d) => { d.fx[active].waveFrequency = v; })} />
          <Slider label="Wave amplitude" value={preset.waveAmplitude} min={0} max={1} step={0.01} onChange={(v) => update((d) => { d.fx[active].waveAmplitude = v; })} />
          <Slider label="Color steps" value={preset.colorNum} min={2} max={16} step={1} onChange={(v) => update((d) => { d.fx[active].colorNum = v; })} />
          <Slider label="Pixel size" value={preset.pixelSize} min={1} max={8} step={1} onChange={(v) => update((d) => { d.fx[active].pixelSize = v; })} />
          <Slider label="Mouse radius" value={preset.mouseRadius} min={0} max={2} step={0.05} onChange={(v) => update((d) => { d.fx[active].mouseRadius = v; })} />
          <ColorField label="Wave color" value={rgb01ToHex(preset.waveColor)} onChange={(v) => update((d) => { d.fx[active].waveColor = hexToRgb01(v); })} />
          <Toggle label="Mouse interaction" value={preset.enableMouseInteraction} onChange={(v) => update((d) => { d.fx[active].enableMouseInteraction = v; })} />
        </div>
      </Group>
    </div>
  );
}
