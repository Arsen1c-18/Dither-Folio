"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * SignalField — a sparse rotating fan of data traces. It deliberately leaves
 * the centre empty so a foreground element can sit there without a hub.
 */
export function SignalField({
  size = 240,
  active = false,
  className,
}: {
  size?: number | string;
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

    let frame = 0;
    let time = 0;
    let rotation = 0;
    let speed = 1;

    const draw = () => {
      const cssSize = Math.max(1, canvas.clientWidth);
      const density = window.devicePixelRatio || 1;
      const pixels = Math.round(cssSize * density);
      if (canvas.width !== pixels || canvas.height !== pixels) {
        canvas.width = pixels;
        canvas.height = pixels;
      }

      const targetSpeed = activeRef.current ? 3 : 1;
      speed += (targetSpeed - speed) * 0.04;
      time += 0.012 * speed;
      rotation += 0.0013 * speed;

      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, cssSize, cssSize);
      context.strokeStyle = getComputedStyle(canvas).color;
      context.fillStyle = context.strokeStyle;
      context.lineCap = "square";

      const center = cssSize / 2;
      const rays = 18;
      for (let index = 0; index < rays; index++) {
        const phase = (index / rays) * Math.PI * 2;
        const angle = phase + rotation;
        const pulse = Math.sin(time + index * 1.73) * 0.5 + 0.5;
        const inner = cssSize * (0.25 + (index % 3) * 0.018);
        const outer = cssSize * (0.64 + pulse * 0.13);
        const x1 = center + Math.cos(angle) * inner;
        const y1 = center + Math.sin(angle) * inner;
        const x2 = center + Math.cos(angle) * outer;
        const y2 = center + Math.sin(angle) * outer;

        context.globalAlpha = 0.12 + pulse * 0.22;
        context.lineWidth = index % 4 === 0 ? 1.2 : 0.7;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        if (index % 3 === 0) {
          const markerSize = index % 6 === 0 ? 3 : 2;
          context.globalAlpha = 0.22 + pulse * 0.28;
          context.fillRect(x2 - markerSize / 2, y2 - markerSize / 2, markerSize, markerSize);
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
      role="img"
      aria-label="Animated signal field"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" aria-hidden />
    </div>
  );
}
