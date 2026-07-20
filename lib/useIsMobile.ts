"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for "is this a phone/tablet?" — used to decide
 * whether the heavy layer (WebGL shaders, Lenis, pointer parallax,
 * backdrop blur, film grain) mounts at all.
 *
 * Mobile = viewport below md (768px) OR primary input can't hover
 * (coarse pointer). Both signals together catch phones, tablets, and
 * touch laptops in tablet mode without penalising small desktop windows
 * that still have a mouse.
 *
 * Starts `false` (desktop) so SSR markup matches the desktop render; the
 * first client effect corrects it before the heavy components mount —
 * they're all dynamically imported/client-only anyway.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(max-width: 767px), ((hover: none) and (pointer: coarse))",
    );
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
