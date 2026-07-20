"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { data } from "@/lib/data";
import { useIsMobile } from "@/lib/useIsMobile";

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

/* Frozen-frame stand-in for phones: same grain-over-dark mood as the
   shader (SVG turbulence ≈ the dither texture, tinted with the preset's
   wave colour) at zero per-frame cost, plus the footer's warm accent
   glow rising from the bottom so the surface doesn't read as flat.
   Mobile GPUs + full-screen fragment shaders are the single biggest
   stutter source on phones. */
const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function StaticDitherFallback({ waveColor = [0.5, 0.5, 0.5] }: DitherProps) {
  const [r, g, b] = waveColor.map((c) => Math.round(c * 255));
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "#050505",
        backgroundImage: `radial-gradient(120% 90% at 50% 20%, rgba(${r},${g},${b},0.16), transparent 70%), ${NOISE_URI}`,
      }}
    />
  );
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
  const isMobile = useIsMobile();
  const props = { ...ditherPresets[preset], ...overrides };

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0">
        {isMobile ? <StaticDitherFallback {...props} /> : <Dither {...props} />}
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
