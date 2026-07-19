"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { site } from "@/constants/site";
import { DitherBackground } from "@/components/fx/DitherBackground";
import { RadialNav } from "@/components/layout/RadialNav";
import { getLibraryEntry, getSlotSelection } from "@/components/library/registry";
import { data } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Decorative crosshair for corners
 */
function Crosshair({ className }: { className?: string }) {
  return (
    <div className={`absolute size-4 ${className}`} aria-hidden>
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[var(--color-border-strong)]" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[var(--color-border-strong)]" />
    </div>
  );
}

/**
 * Live local time widget
 */
function LiveTime() {
  const [time, setTime] = useState("");
  
  useEffect(() => {
    const update = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: site.timezone || "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-1 text-right">
      <span className="label-system text-[var(--color-subtle)]">LOCAL TIME (IST)</span>
      <span className="font-mono text-sm text-[var(--color-muted)]">{time || "00:00:00"}</span>
    </div>
  );
}

/**
 * Static center alignment HUD marker
 */
function CenterAlignment() {
  return (
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-60">
      <div className="flex items-end gap-1.5 mb-0.5">
        <span className="w-6 h-px bg-[var(--color-border-strong)] mb-[1px]" />
        <span className="w-px h-3 bg-[var(--color-accent)]" />
        <span className="w-6 h-px bg-[var(--color-border-strong)] mb-[1px]" />
      </div>
      <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[var(--color-muted)]">
        CTRL_AXIS
      </span>
    </div>
  );
}

const RADIAL_NAV_CLASS = "pointer-events-auto absolute right-[max(-26vw,-30rem)] top-1/2 size-[min(52vw,58rem)] -translate-y-1/2";

/**
 * Full-viewport hero — text left over the dither shader backdrop,
 * spinning radial navigation dial on the right (morphs into the menu
 * on hover, replacing a traditional navbar).
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const radialNav = getLibraryEntry(getSlotSelection(data.ui, "radial-navbar"));

  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.8, delay: delay + 2.6, ease: EASE },
        };

  const fadeIn = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.7, delay: delay + 2.6, ease: EASE },
        };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Dither shader backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        }}
      >
        <div className="pointer-events-auto h-full w-full">
          <DitherBackground preset="hero" overlay={0} />
        </div>
      </div>

      {/* Decorative Corner HUD Elements */}
      <Crosshair className="left-6 top-6 sm:left-10 sm:top-10 lg:left-12 lg:top-12" />
      <Crosshair className="right-6 top-6 sm:right-10 sm:top-10 lg:right-12 lg:top-12" />
      <Crosshair className="bottom-6 left-6 sm:bottom-10 sm:left-10 lg:bottom-12 lg:left-12" />
      <Crosshair className="bottom-6 right-6 sm:bottom-10 sm:right-10 lg:bottom-12 lg:right-12" />

      {/* Top Header / Branding */}
      <motion.div
        {...fadeIn(0.9)}
        className="absolute top-6 left-6 right-6 flex items-start justify-between sm:top-10 sm:left-10 sm:right-10 lg:top-12 lg:left-12 lg:right-12"
      >
        <div className="flex flex-col gap-1">
          <span className="label-system text-[var(--color-subtle)]">PORTFOLIO.OS</span>
          <span className="font-mono text-sm text-[var(--color-muted)]">v2.0.26</span>
        </div>

        {/* Top Mid: Static Center Alignment HUD */}
        <CenterAlignment />
        
        <div className="hidden sm:flex flex-col gap-1 text-right">
          <span className="label-system text-[var(--color-subtle)]">NETWORK</span>
          <span className="font-mono text-sm text-[var(--color-accent)] flex items-center gap-2 justify-end">
             <span className="size-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
             ESTABLISHED
          </span>
        </div>
      </motion.div>

      {/* Main layout grid */}
      <div className="pointer-events-none relative grid min-h-screen grid-cols-1 items-center px-6 sm:px-10 md:grid-cols-[1.1fr_1fr] lg:px-20">

        {/* ── LEFT: headline + CTAs ── */}
        <div className="pointer-events-auto relative z-10 flex max-w-2xl flex-col gap-0 pt-28 md:translate-x-8 md:pt-0 lg:translate-x-50">

          {/* Status badge */}
          <motion.span {...reveal(0.0)} className="label-system flex items-center gap-3 font-bold">
            <span className="inline-block h-px w-10 bg-[var(--color-accent)]" />
            System_01 — Initialized
          </motion.span>

          {/* Name */}
          <motion.h1
            {...reveal(0.14)}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
          >
            {site.handle}
          </motion.h1>

          {/* Role + location inline */}
          <motion.div
            {...reveal(0.26)}
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold label-system text-[var(--color-subtle)]"
          >
            <span className="text-[var(--color-muted)]">{site.role}</span>
            <span className="text-[var(--color-faint)]">/</span>
            <span>{site.location}</span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            {...reveal(0.36)}
            className="mt-5 max-w-md text-balance text-sm font-semibold text-[var(--color-muted)] sm:text-base"
          >
            {site.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div {...reveal(0.46)} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="group rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)]"
            >
              View work{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[var(--color-border-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:border-[var(--color-foreground)]"
            >
              Get in touch
            </a>
          </motion.div>

        </div>

        {/* ── RIGHT: radial nav dial — smaller, vertically contained ── */}
        <motion.div
          className="relative z-40 hidden md:flex md:items-center md:justify-end"
          style={{ paddingTop: "6vh", paddingBottom: "6vh" }}
          initial={reduceMotion ? false : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 3, ease: EASE }}
        >
          {/*
            Before: size-[min(66vw,76rem)] hanging off right edge
            Now:    capped at 52vw/52rem with py-[6vh] so it has
                    breathing room from top and bottom of viewport
          */}
          {radialNav?.slot === "radial-navbar"
            ? radialNav.renderLive(RADIAL_NAV_CLASS)
            : <RadialNav className={RADIAL_NAV_CLASS} />}
        </motion.div>
      </div>

      {/* Scroll hint & System Status Bottom Bar */}
      <motion.div
        {...fadeIn(0.9)}
        className="absolute bottom-6 left-6 right-6 flex items-end justify-between sm:bottom-10 sm:left-10 sm:right-10 lg:bottom-12 lg:left-12 lg:right-12"
      >
        <div className="flex flex-col gap-1">
          <span className="label-system text-[var(--color-subtle)]">SYS.STATUS</span>
          <span className="font-mono text-sm text-[var(--color-accent)]">ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="flex items-center gap-3 md:absolute md:left-1/2 md:-translate-x-1/2">
          <span className="label-system text-[var(--color-subtle)]">Scroll ↓</span>
        </div>

        <div className="hidden sm:block">
          <LiveTime />
        </div>
      </motion.div>
    </section>
  );
}
