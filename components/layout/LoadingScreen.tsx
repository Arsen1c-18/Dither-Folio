"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DitherBackground } from "@/components/fx/DitherBackground";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Smooth counter for the progress bar
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(Math.round((step / steps) * 100), 100);
      setProgress(currentProgress);
      
      if (step >= steps) {
        clearInterval(timer);
        // Hold at 100% briefly before fading out
        setTimeout(() => setIsVisible(false), 400); 
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Ensure body scroll is locked while loading
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-[var(--color-foreground)]"
        >
          {/* Circular Ring Mask over the standard Dither effect */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              maskImage: 'radial-gradient(circle at center, transparent 25%, black 28%, black 45%, transparent 55%)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 25%, black 28%, black 45%, transparent 55%)'
            }}
          >
            <DitherBackground preset="hero" overlay={0} />
          </div>
          
          {/* Top Left HUD */}
          <div className="absolute left-6 top-6 sm:left-10 sm:top-10">
            <span className="label-system text-[0.65rem] tracking-widest text-[var(--color-muted)]">
              SYSTEM_01
            </span>
          </div>

          {/* Top Right HUD */}
          <div className="absolute right-6 top-6 flex items-center gap-3 sm:right-10 sm:top-10">
            <span className="label-system text-[0.65rem] tracking-widest text-[var(--color-muted)]">
              INITIALIZING
            </span>
            <span className="label-system text-[0.65rem] text-[var(--color-accent)]">
              [ <span className="animate-pulse text-lg leading-none">•</span> ]
            </span>
          </div>

          {/* Bottom Left HUD specs */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-6 sm:bottom-10 sm:left-10">
            <div className="flex flex-col gap-1">
              <span className="label-system text-[0.55rem] text-[var(--color-accent)]">STATUS</span>
              <span className="label-system text-[0.6rem] text-[var(--color-muted)]">CONNECTING TO SYSTEM</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="label-system text-[0.55rem] text-[var(--color-accent)]">CHECKSUM</span>
              <span className="label-system text-[0.6rem] text-[var(--color-muted)]">0X8A3F_7D2C</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="label-system text-[0.55rem] text-[var(--color-accent)]">PROTOCOL</span>
              <span className="label-system text-[0.6rem] text-[var(--color-muted)]">SECURE_256</span>
            </div>
          </div>

          {/* Bottom Right Target UI */}
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10">
            <div className="relative flex size-12 items-center justify-center opacity-60">
              <div className="size-1.5 bg-[var(--color-accent)]" />
              {/* Corner brackets */}
              <div className="absolute -left-1 -top-1 size-3 border-l border-t border-[var(--color-subtle)]" />
              <div className="absolute -right-1 -top-1 size-3 border-r border-t border-[var(--color-subtle)]" />
              <div className="absolute -bottom-1 -left-1 size-3 border-b border-l border-[var(--color-subtle)]" />
              <div className="absolute -bottom-1 -right-1 size-3 border-b border-r border-[var(--color-subtle)]" />
            </div>
          </div>

          {/* Center Loading Content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <h2 className="font-display text-4xl font-medium tracking-[0.2em] sm:text-5xl">
                LOADING<span className="text-[var(--color-accent)]">_</span>
              </h2>
              <p className="label-system text-[0.65rem] tracking-[0.3em] text-[var(--color-subtle)]">
                PREPARING EXPERIENCE
              </p>
            </div>

            <div className="flex w-64 flex-col items-center gap-4 sm:w-80">
              {/* Progress Bar */}
              <div className="h-[2px] w-full bg-[var(--color-border-strong)]">
                <motion.div 
                  className="h-full bg-[var(--color-accent)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.05 }}
                />
              </div>
              
              <span className="font-mono text-xs text-[var(--color-subtle)]">
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
