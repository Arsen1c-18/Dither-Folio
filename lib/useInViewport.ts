"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is inside (or near) the viewport so persistent
 * animation loops — WebGL canvases, 2D-canvas RAF loops — can pause while
 * scrolled out of view instead of burning GPU/CPU for nothing.
 *
 * `margin` pre-warms the loop slightly before the element scrolls in, so
 * resuming is never visible on screen.
 */
export function useInViewport<T extends HTMLElement = HTMLDivElement>(
  margin = "200px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return { ref, inView };
}
