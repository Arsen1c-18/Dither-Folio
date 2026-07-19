"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((value) => value / 16));

/**
 * DitherDisc — a borderless, Bayer-dithered field. Its annular signal and
 * interference waves drift continuously; hovering makes the pattern move
 * faster. It inherits its ink from `currentColor`.
 */
export function DitherDisc({
  size = 240,
  active = false,
  className,
}: {
  size?: number | string;
  /** Lets a parent (such as the navbar) raise the motion intensity. */
  active?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const [hovered, setHovered] = useState(false);
  activeRef.current = active || hovered;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const cell = 7;
    let frame = 0;
    let time = 0;
    let rotation = 0;
    let speed = 1;

    const draw = () => {
      const pixelSize = Math.max(1, Math.floor(canvas.clientWidth / cell));
      if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
        canvas.width = pixelSize;
        canvas.height = pixelSize;
      }

      const ink = getComputedStyle(canvas).color;
      const targetSpeed = activeRef.current ? 3 : 1;
      speed += (targetSpeed - speed) * 0.04;
      time += 0.016 * speed;
      rotation += 0.0011 * speed;

      context.clearRect(0, 0, pixelSize, pixelSize);
      context.fillStyle = ink;
      context.imageSmoothingEnabled = false;

      const center = pixelSize / 2;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);

      for (let y = 0; y < pixelSize; y++) {
        for (let x = 0; x < pixelSize; x++) {
          const dx = x - center;
          const dy = y - center;
          const distance = Math.hypot(dx, dy) / center;
          if (distance > 1) continue;

          const rx = dx * cosine - dy * sine;
          const ry = dx * sine + dy * cosine;
          const band = 1 - Math.abs(distance - 0.62) * 2.6;
          const waves =
            Math.sin(rx * 0.32 + time * 0.9) * Math.sin(ry * 0.27 - time * 0.7) * 0.28 +
            Math.sin((rx + ry) * 0.12 + time * 0.5) * 0.18;
          const edge = Math.min(1, (1 - distance) * 6);
          const field = Math.max(0, band * 0.75 + waves + 0.08) * edge;

          if (field > BAYER[y % 4][x % 4]) {
            context.globalAlpha = Math.min(0.85, 0.3 + field * 0.6);
            context.fillRect(x, y, 1, 1);
          }
        }
      }

      context.globalAlpha = 1;
      if (!reduce) frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return (
    <div
      className={cn("relative select-none text-[var(--color-muted)]", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Animated dither disc"
      role="img"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
        aria-hidden
      />
    </div>
  );
}
