"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BlobPal — a gooey accent-colored blob that squishes as it breathes, with
 * big glossy eyes that follow the cursor around the page.
 */

export function BlobPal({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setLook({ x: nx * 6, y: ny * 5 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("relative inline-block cursor-default select-none", className)}
      aria-hidden
    >
      <style>{`
        @keyframes blob-squish {
          0%, 100% { border-radius: 46% 54% 52% 48% / 55% 48% 52% 45%; transform: scale(1, 1); }
          33%      { border-radius: 52% 48% 45% 55% / 48% 55% 45% 52%; transform: scale(1.04, 0.95); }
          66%      { border-radius: 48% 52% 55% 45% / 52% 45% 55% 48%; transform: scale(0.96, 1.05); }
        }
        @keyframes blob-wiggle {
          0%, 100% { border-radius: 52% 48% 45% 55% / 48% 55% 45% 52%; transform: scale(1.12, 0.9) rotate(-3deg); }
          50%      { border-radius: 46% 54% 55% 45% / 55% 45% 55% 48%; transform: scale(0.92, 1.14) rotate(3deg); }
        }
      `}</style>
      <span
        className="block size-20 bg-[var(--color-accent)] opacity-90 sm:size-24"
        style={{
          borderRadius: "46% 54% 52% 48% / 55% 48% 52% 45%",
          animation: reduce
            ? undefined
            : hover
              ? "blob-wiggle 0.6s ease-in-out infinite"
              : "blob-squish 4.5s ease-in-out infinite",
        }}
      />
      {/* eyes track the cursor; go happy-closed on hover */}
      {[-13, 13].map((dx) =>
        hover ? (
          <span
            key={dx}
            className="absolute left-1/2 top-[40%] font-mono text-sm font-bold text-[var(--color-bg)]"
            style={{ marginLeft: dx - 6 }}
          >
            ^
          </span>
        ) : (
          <span
            key={dx}
            className="absolute left-1/2 top-[38%] size-4 rounded-full bg-[var(--color-bg)]"
            style={{ marginLeft: dx - 8 }}
          >
            <span
              className="absolute size-2 rounded-full bg-[var(--color-foreground)] transition-transform duration-150"
              style={{ left: 4, top: 4, transform: `translate(${look.x}px, ${look.y}px)` }}
            />
          </span>
        ),
      )}
    </span>
  );
}
