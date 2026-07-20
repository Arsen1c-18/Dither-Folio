"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal animated globe rendered on a 2D canvas — no three.js cost.
 * ~700 four-pointed star sparkles on a fibonacci sphere, depth-faded,
 * slow constant rotation, with a scattering of bright red accent stars.
 * Stars near the cursor repel outward and ease back when it leaves.
 */
export function HeroGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones get a lighter globe: fewer stars, no per-star shadow glow
    const mobile = window.matchMedia(
      "(max-width: 767px), ((hover: none) and (pointer: coarse))",
    ).matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const styles = getComputedStyle(document.documentElement);
    const INK = styles.getPropertyValue("--color-foreground").trim() || "#e8e6e1";
    const ACCENT = styles.getPropertyValue("--color-accent").trim() || "#ff3b3b";

    const TILT = -0.4;
    const COUNT = mobile ? 220 : 700;
    let W = 0, H = 0, R = 0;
    let rotation = 0;
    const speed = 0.0016;
    let raf = 0;
    let time = 0;
    // pause the loop while the canvas is scrolled out of view
    let inView = true;
    let running = false;

    // cursor in canvas coords; far away by default so nothing repels
    let mouseX = -1e5, mouseY = -1e5;

    const points: {
      x: number; y: number; z: number;
      accent: boolean; size: number; twinkle: number;
      ox: number; oy: number;
    }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const theta = phi * i;
      points.push({
        x: Math.cos(theta) * rad,
        y,
        z: Math.sin(theta) * rad,
        // ~1 in 40 is a bright red star
        accent: i % 41 === 0,
        size: 0.9 + (i % 7) * 0.16,
        twinkle: (i % 13) / 13 * Math.PI * 2,
        ox: 0,
        oy: 0,
      });
    }

    /** Four-pointed sparkle: points up/right/down/left, pinched diagonals. */
    function star(x: number, y: number, r: number) {
      if (!ctx) return;
      const inner = r * 0.32;
      const d = inner * Math.SQRT1_2;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + d, y - d);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + d, y + d);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - d, y + d);
      ctx.lineTo(x - r, y);
      ctx.lineTo(x - d, y - d);
      ctx.closePath();
      ctx.fill();
    }

    function resize() {
      if (!canvas || !ctx) return;
      // layout size, not getBoundingClientRect — ancestors may be
      // CSS-scaled (scroll zoom) and that must not shrink the bitmap
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      R = Math.min(W, H) * 0.38;
    }

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    function frame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      time += 0.016;

      const cx = W / 2;
      const cy = H / 2;

      // halo ring
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.16, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(232,230,225,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      rotation += speed;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);

      const repelRadius = R * 0.45;

      const projected = points.map((p) => {
        const x = p.x * cosR - p.z * sinR;
        const z0 = p.x * sinR + p.z * cosR;
        const y = p.y * cosT - z0 * sinT;
        const z = p.y * sinT + z0 * cosT;

        const sx = cx + x * R;
        const sy = cy - y * R;

        // repel from cursor with smooth falloff
        const dx = sx - mouseX;
        const dy = sy - mouseY;
        const dist = Math.hypot(dx, dy);
        let tx = 0, ty = 0;
        if (dist < repelRadius && dist > 0.001) {
          const force = (1 - dist / repelRadius) ** 2 * repelRadius * 0.5;
          tx = (dx / dist) * force;
          ty = (dy / dist) * force;
        }
        p.ox += (tx - p.ox) * 0.12;
        p.oy += (ty - p.oy) * 0.12;

        return { p, sx: sx + p.ox, sy: sy + p.oy, z };
      });
      projected.sort((a, b) => a.z - b.z);

      for (const { p, sx, sy, z } of projected) {
        const depth = (z + 1) / 2;

        if (p.accent) {
          // bright red star — twinkles, glows, always vivid
          const tw = 0.75 + 0.25 * Math.sin(time * 2 + p.twinkle);
          const size = p.size * (0.9 + depth) * 1.9 * tw;
          ctx.fillStyle = ACCENT;
          ctx.globalAlpha = (0.5 + depth * 0.5) * tw;
          if (!mobile) {
            // canvas shadowBlur is a big per-draw cost — desktop only
            ctx.shadowColor = ACCENT;
            ctx.shadowBlur = 10 * depth;
          }
          star(sx, sy, size);
          ctx.shadowBlur = 0;
        } else {
          const alpha = 0.18 + depth * 0.72;
          const size = p.size * (0.55 + depth) * 1.4;
          ctx.fillStyle = INK;
          ctx.globalAlpha = alpha;
          star(sx, sy, size);
        }
        ctx.globalAlpha = 1;
      }

      if (!inView) {
        // parked: skip scheduling until the observer wakes us up again
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function onMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // map through the rect so CSS transforms (scroll zoom on ancestors)
      // don't skew screen coords vs canvas coords
      mouseX = ((e.clientX - rect.left) / rect.width) * W;
      mouseY = ((e.clientY - rect.top) / rect.height) * H;
    }

    function onLeaveWindow() {
      mouseX = -1e5;
      mouseY = -1e5;
    }

    resize();
    window.addEventListener("resize", resize);

    // Pause the RAF loop entirely while off-screen; resume when scrolled back
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (reduce) return;
        if (inView && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(canvas);

    if (reduce) {
      frame();
      cancelAnimationFrame(raf);
    } else {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeaveWindow);
      running = true;
      raf = requestAnimationFrame(frame);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeaveWindow);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
