"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { data } from "@/lib/data";

/**
 * Client-only wrapper around the interactive React Bits-inspired dither shader.
 */

type DitherProps = {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: [number, number, number];
  colorNum?: number;
  pixelSize?: number;
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  /**
   * Anchor the wave field to the top-left instead of the centre so the
   * pattern stays put when the container's height changes (e.g. expanding
   * cards) — only newly revealed area at the bottom gets new field.
   */
  anchorTop?: boolean;
};

const Dither = dynamic(
  () => import("@/components/Dither").then((module) => module.default),
  { ssr: false },
);

/**
 * Tuning presets — pick a mood, override individual props as needed.
 * Sourced from data/portfolio.json (`fx`) so the dev-only dashboard can
 * live-tune the shader.
 */
export const ditherPresets = data.fx satisfies Record<string, DitherProps>;

export type DitherPreset = keyof typeof ditherPresets;

interface DitherBackgroundProps extends DitherProps {
  /** Named tuning preset applied first; explicit props still win. */
  preset?: DitherPreset;
  /** Extra classes on the positioning wrapper. */
  className?: string;
  /** Dark scrim opacity over the shader (0–1) so foreground text stays legible. */
  overlay?: number;
}

/**
 * Positioned, overlaid dither surface. Drop it into any `relative` container:
 *
 *   <div className="relative">
 *     <DitherBackground preset="hero" />
 *     …content…
 *   </div>
 */
export function DitherBackground({
  preset = "hero",
  className,
  overlay = 0.4,
  ...overrides
}: DitherBackgroundProps) {
  const props = { ...ditherPresets[preset], ...overrides };

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0">
        <Dither {...props} />
      </div>

      {/* Legibility scrim */}
      {overlay > 0 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: `rgba(5,5,5,${overlay})` }}
        />
      )}
    </div>
  );
}

export default DitherBackground;
