"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type RadialNavBackdropProps = {
  open: boolean;
  preview: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Keeps preview veils local while mounting live-nav veils at the viewport root. */
export function RadialNavBackdrop({ open, preview, className, style }: RadialNavBackdropProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const veil = (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "pointer-events-none inset-0 z-30 backdrop-blur-md",
            className,
            preview ? "absolute rounded-2xl" : "fixed",
          )}
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );

  if (preview) return veil;
  return mounted ? createPortal(veil, document.body) : null;
}
