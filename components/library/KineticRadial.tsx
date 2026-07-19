"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const TICKS = Array.from({ length: 72 }, (_, index) => index);
const CONTACTS = [12, 73, 147, 216, 284, 332];

function Tick({ index }: { index: number }) {
  const major = index % 6 === 0;
  const medium = index % 3 === 0;
  const inner = major ? 87 : medium ? 90 : 92;
  return (
    <line
      x1="100"
      y1={inner}
      x2="100"
      y2="96"
      transform={`rotate(${index * 5} 100 100)`}
      stroke="currentColor"
      strokeWidth={major ? 1 : 0.55}
      opacity={major ? 0.65 : 0.28}
    />
  );
}

/**
 * KineticRadial — a calm circular interface with calibrated marks and two
 * slow telemetry layers. The center is kept open for foreground content.
 */
export function KineticRadial({
  size = 240,
  active = false,
  className,
}: {
  size?: number | string;
  active?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const duration = active ? "32s" : "72s";

  return (
    <div
      className={cn("relative select-none text-[var(--color-muted)]", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Kinetic radial interface"
    >
      <style>{`
        @keyframes kinetic-radial-clockwise { to { transform: rotate(360deg); } }
        @keyframes kinetic-radial-counter { to { transform: rotate(-360deg); } }
      `}</style>

      <div className="absolute inset-0">
        {/* Stable calibration frame. */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
          <circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" strokeWidth="0.45" strokeDasharray="1 5" opacity="0.28" />
          {TICKS.map((index) => <Tick key={index} index={index} />)}
          {[0, 120, 240].map((angle) => (
            <line
              key={angle}
              x1="100"
              y1="26"
              x2="100"
              y2="45"
              transform={`rotate(${angle} 100 100)`}
              stroke="currentColor"
              strokeWidth="0.55"
              opacity="0.3"
            />
          ))}
        </svg>

        {/* Three broken outer tracks, moving as one quiet data layer. */}
        <div
          className={cn("absolute inset-[5%]", reduce && "animation-paused")}
          style={{ animation: `kinetic-radial-clockwise ${duration} linear infinite` }}
          aria-hidden
        >
          <svg viewBox="0 0 200 200" className="size-full overflow-visible">
            {[0, 120, 240].map((angle) => (
              <circle
                key={angle}
                cx="100"
                cy="100"
                r="91"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeDasharray="34 538"
                transform={`rotate(${angle} 100 100)`}
                opacity="0.8"
              />
            ))}
          </svg>
        </div>

        {/* Counter-rotating telemetry arcs with a deliberately empty hub. */}
        <div
          className={cn("absolute inset-[18%]", reduce && "animation-paused")}
          style={{ animation: `kinetic-radial-counter ${active ? "28s" : "64s"} linear infinite` }}
          aria-hidden
        >
          <svg viewBox="0 0 200 200" className="size-full overflow-visible">
            <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="48 20 10 32" opacity="0.55" />
            {CONTACTS.map((angle, index) => (
              <g key={angle} transform={`rotate(${angle} 100 100)`}>
                <line x1="100" y1="25" x2="100" y2={index % 2 === 0 ? "35" : "31"} stroke="currentColor" strokeWidth="1.25" opacity="0.75" />
                <circle
                  cx="100"
                  cy={index % 2 === 0 ? "35" : "31"}
                  r={index % 2 === 0 ? "2" : "1.5"}
                  fill="currentColor"
                  opacity="0.7"
                />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
