"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Keeps anchor navigation and wheel scrolling feeling like one continuous canvas. */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Touch devices already have native momentum scrolling — Lenis there
    // just adds a permanent RAF loop and fights the platform's feel.
    const coarseTouch = window.matchMedia("(hover: none) and (pointer: coarse)");
    if (reducedMotion.matches || coarseTouch.matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.09,
      smoothWheel: true,
      touchMultiplier: 1.35,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -24, duration: 1.4, lerp: 0.09 },
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
