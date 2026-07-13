"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

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
};

const Dither = dynamic(
  () => import("@/components/Dither").then((module) => module.default),
  { ssr: false },
);

/** Tuning presets — pick a mood, override individual props as needed. */
export const ditherPresets = {
  /** Slow, moody field for full-screen hero backdrops. */
  hero: {
    waveSpeed: 0.12,
    waveFrequency: 1,
    waveAmplitude: 0.25,
    waveColor: [0.6, 0.6, 0.6] as [number, number, number],
    colorNum: 12,
    pixelSize: 2,
    enableMouseInteraction: true,
    mouseRadius: 0.1,
  },
  /** Faster, tighter grain for smaller contained panels. */
  panel: {
    waveSpeed: 0.06,
    waveFrequency: 5,
    waveAmplitude: 0.4,
    waveColor: [0.65, 0.18, 0.18] as [number, number, number],
    colorNum: 4,
    pixelSize: 3,
    enableMouseInteraction: false,
    mouseRadius: 1,
  },
  /** Very still, low-contrast strip for footers / dividers. */
  strip: {
    waveSpeed: 0.025,
    waveFrequency: 4,
    waveAmplitude: 0.25,
    waveColor: [0.42, 0.40, 0.38] as [number, number, number],
    colorNum: 4,
    pixelSize: 2,
    enableMouseInteraction: false,
    mouseRadius: 1,
  },
} satisfies Record<string, DitherProps>;

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
