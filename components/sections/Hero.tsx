"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { site } from "@/constants/site";
import { DitherBackground } from "@/components/fx/DitherBackground";
import { RadialNav } from "@/components/layout/RadialNav";
import { getLibraryEntry, getSlotSelection } from "@/components/library/registry";
import { data } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as const;

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
    <div className="flex flex-col items-end gap-1 text-right">
      <span className="label-system text-[var(--color-subtle)]">LOCAL — IST</span>
      <span className="font-mono text-sm tabular-nums text-[var(--color-foreground)]">
        {time || "00:00:00"}
        <span className="ml-1.5 inline-block size-1 rounded-full bg-[var(--color-accent)] align-middle animate-pulse" />
      </span>
    </div>
  );
}

/**
 * Center HUD marker — tick ruler with an accent needle + location readout
 */
function CenterAlignment() {
  return (
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 opacity-70">
      <div className="flex items-end gap-[5px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={
              i === 4
                ? "w-px h-3.5 bg-[var(--color-accent)]"
                : `w-px ${i % 2 === 0 ? "h-2" : "h-1"} bg-[var(--color-border-strong)]`
            }
          />
        ))}
      </div>
      <span className="font-mono text-[0.6rem] tracking-[0.25em] text-[var(--color-subtle)]">
        18.52° N / 73.86° E — {site.location.toUpperCase()}
      </span>
    </div>
  );
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#_/<>[]";

/**
 * Headline decrypt effect — characters scramble, then resolve left to right
 */
function DecryptText({ text, start }: { text: string; start: boolean }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!start || reduceMotion) return;
    const totalFrames = 26;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const resolved = Math.floor((frame / totalFrames) * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        out +=
          i < resolved || text[i] === " "
            ? text[i]
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplay(out);
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 42);
    return () => clearInterval(id);
  }, [start, text, reduceMotion]);

  return <span aria-label={text}>{display}</span>;
}

/**
 * Rotating type-out — cycles through tagline phrases with a typing cursor
 */
function RotatingTagline({ phrases }: { phrases: string[] }) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[idx];
    if (!deleting && chars === current.length) {
      const hold = setTimeout(() => setDeleting(true), 2400);
      return () => clearTimeout(hold);
    }
    if (deleting && chars === 0) {
      setDeleting(false);
      setIdx((idx + 1) % phrases.length);
      return;
    }
    const tick = setTimeout(
      () => setChars((c) => c + (deleting ? -1 : 1)),
      deleting ? 28 : 55,
    );
    return () => clearTimeout(tick);
  }, [chars, deleting, idx, phrases]);

  return (
    <span>
      {phrases[idx].slice(0, chars)}
      <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse bg-[var(--color-accent)]" />
    </span>
  );
}

const BRACKET_SPRING = { type: "spring", stiffness: 320, damping: 14, mass: 0.7 } as const;

/**
 * CTA pill whose label reads "[ text ]" — the brackets spring apart on hover
 */
function BracketCta({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "solid" | "outline";
  children: React.ReactNode;
}) {
  const style =
    variant === "solid"
      ? "bg-[var(--color-accent)] text-[#050505] hover:bg-[var(--color-accent-bright)]"
      : "border border-[var(--color-border-strong)] text-[var(--color-foreground)] hover:border-[var(--color-foreground)]";

  return (
    <motion.a
      href={href}
      className={`group flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${style}`}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        aria-hidden
        className="font-mono font-normal opacity-60"
        variants={{ rest: { x: 0 }, hover: { x: -5 } }}
        transition={BRACKET_SPRING}
      >
        [
      </motion.span>
      <span className="mx-2">{children}</span>
      <motion.span
        aria-hidden
        className="font-mono font-normal opacity-60"
        variants={{ rest: { x: 0 }, hover: { x: 5 } }}
        transition={BRACKET_SPRING}
      >
        ]
      </motion.span>
    </motion.a>
  );
}

// Dial diameter is capped by viewport height as well as width: the hero's
// top HUD and bottom status bar each occupy ~7rem of the svh, so the circle
// must never exceed 100svh minus that band or it overlaps them (visible in
// wide-but-short viewports, e.g. Chrome at 100% on 1080p). The right offset
// derives from the same variable so exactly half the dial stays off-screen
// at every resulting size.
const RADIAL_NAV_CLASS =
  "pointer-events-auto absolute [--dial:min(52vw,calc(100svh_-_14rem),58rem)] right-[calc(var(--dial)/-2)] top-1/2 size-[var(--dial)] -translate-y-1/2";

/**
 * Full-viewport hero — text left over the dither shader backdrop,
 * spinning radial navigation dial on the right (morphs into the menu
 * on hover, replacing a traditional navbar).
 *
 * Reveals are driven by the loader's "portfolio:loaded" event rather
 * than a hardcoded delay, so the hero never sits empty or animates
 * under the loading screen.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  // The radial dial is a desktop-only interaction (hover-driven, heavy
  // canvas) — don't even mount it below md so phones skip its render loop
  const [isDesktop, setIsDesktop] = useState(false);
  const radialNav = getLibraryEntry(getSlotSelection(data.ui, "radial-navbar"));

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if ((window as unknown as { __portfolioLoaded?: boolean }).__portfolioLoaded) {
      setReady(true);
      return;
    }
    const onLoaded = () => setReady(true);
    window.addEventListener("portfolio:loaded", onLoaded);
    return () => window.removeEventListener("portfolio:loaded", onLoaded);
  }, []);

  // Pointer parallax — background and brackets drift opposite the mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 45, damping: 18, mass: 0.6 });
  const bgX = useTransform(sx, (v) => v * -10);
  const bgY = useTransform(sy, (v) => v * -8);

  // rAF-gated: mousemove can fire several times per frame, but one update
  // per frame is all the springs can consume anyway. Desktop-only — taps
  // synthesize mousemove events and would jolt the background.
  const parallaxFrame = useRef(0);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduceMotion || !isDesktop || parallaxFrame.current) return;
    const { clientX, clientY } = e;
    parallaxFrame.current = requestAnimationFrame(() => {
      parallaxFrame.current = 0;
      mx.set((clientX / window.innerWidth - 0.5) * 2);
      my.set((clientY / window.innerHeight - 0.5) * 2);
    });
  };
  useEffect(() => () => cancelAnimationFrame(parallaxFrame.current), []);

  const phrases = useMemo(() => {
    const parts = site.tagline
      .split(/,\s*|\s+and\s+/i)
      .map((p) => p.trim().replace(/\.$/, ""))
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    return parts.length > 0 ? parts : [site.tagline];
  }, []);

  // Blur reveals are desktop-only — animated filters are costly on phones
  const hidden = isDesktop
    ? { opacity: 0, y: 24, filter: "blur(8px)" }
    : { opacity: 0, y: 24 };
  const reveal = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: hidden,
          animate: ready
            ? { opacity: 1, y: 0, ...(isDesktop ? { filter: "blur(0px)" } : {}) }
            : hidden,
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const fadeIn = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: ready ? 1 : 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section
      id="hero"
      className="relative min-h-svh overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dither shader backdrop — drifts subtly against the pointer.
          Hidden on mobile: the static fallback reads as a flat dead
          texture there, so phones get the footer's warm glow instead. */}
      <motion.div
        className="pointer-events-none absolute -inset-3 max-md:hidden"
        style={{
          x: reduceMotion ? 0 : bgX,
          y: reduceMotion ? 0 : bgY,
          maskImage: "linear-gradient(to bottom, black 40%, rgba(0,0,0,0.5) 70%, transparent 96%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 40%, rgba(0,0,0,0.5) 70%, transparent 96%)",
        }}
      >
        <div className="pointer-events-auto h-full w-full">
          <DitherBackground preset="hero" overlay={0} />
        </div>
      </motion.div>

      {/* Mobile backdrop — the footer's warm glow, rising from the bottom
          edge. Replaces the shader entirely below md so the hero opens on
          the same texture the page closes with, at zero animation cost. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 115%, rgba(255,59,59,0.06) 0%, rgba(255,59,59,0.02) 45%, transparent 75%)",
        }}
      />

      {/* Top Header / Branding */}
      <motion.div
        {...fadeIn(0.5)}
        className="absolute top-20 left-6 right-6 z-50 flex items-start justify-between sm:left-14 sm:right-14 md:top-10 lg:top-12 lg:left-16 lg:right-16"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-[var(--color-border-strong)] font-mono text-[0.65rem] text-[var(--color-accent)]">
            {"//"}
          </span>
          <div className="flex flex-col">
            <span className="label-system text-[var(--color-foreground)]">PORTFOLIO.OS</span>
            <span className="font-mono text-[0.65rem] text-[var(--color-subtle)]">BUILD v2.0.26 — STABLE</span>
          </div>
        </div>

        {/* Top Mid: Static Center Alignment HUD */}
        <CenterAlignment />

        <div className="hidden sm:flex flex-col items-end gap-1 text-right md:-mt-2 lg:-mt-4">
          <span className="label-system text-[var(--color-subtle)]">NETWORK</span>
          <span className="font-mono text-sm text-[var(--color-accent)] flex items-center gap-2 justify-end">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            ESTABLISHED
          </span>
        </div>
      </motion.div>

      {/* Main layout grid */}
      <div className="pointer-events-none relative grid min-h-svh grid-cols-1 items-center px-6 sm:px-10 md:grid-cols-[1.1fr_1fr] lg:px-20">

        {/* ── LEFT: headline + CTAs ── */}
        <div className="pointer-events-auto relative z-10 flex max-w-2xl flex-col gap-0 pt-28 md:translate-x-8 md:pt-0 lg:translate-x-50">

          {/* Status badge */}
          <motion.span {...reveal(0.0)} className="label-system flex items-center gap-3 font-bold">
            <span className="inline-block h-px w-10 bg-[var(--color-accent)]" />
            System_01 — Initialized
          </motion.span>

          {/* Name — decrypt scramble resolves into the handle */}
          <motion.h1
            {...reveal(0.1)}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
          >
            <DecryptText text={site.handle} start={ready} />
          </motion.h1>

          {/* Role + availability */}
          <motion.div
            {...reveal(0.22)}
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold label-system text-[var(--color-subtle)]"
          >
            <span className="text-[var(--color-muted)]">{site.role}</span>
            {site.available && (
              <>
                <span className="text-[var(--color-faint)]">/</span>
                <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
                  <span className="size-1 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  OPEN TO WORK
                </span>
              </>
            )}
          </motion.div>

          {/* Tagline — rotating type-out of what I do */}
          <motion.p
            {...reveal(0.32)}
            className="mt-5 min-h-[1.75rem] max-w-md text-sm font-semibold text-[var(--color-muted)] sm:text-base"
          >
            {reduceMotion ? site.tagline : <RotatingTagline phrases={phrases} />}
          </motion.p>

          {/* CTAs */}
          <motion.div {...reveal(0.42)} className="mt-8 flex flex-wrap items-center gap-5">
            <BracketCta href="#projects" variant="solid">
              View work{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </BracketCta>
            <BracketCta href="#contact" variant="outline">
              Get in touch
            </BracketCta>
          </motion.div>

          {/* Mobile-only advisory — the full interactive experience is
              tuned for pointer + large viewport */}
          <motion.p
            {...reveal(0.52)}
            className="mt-8 flex items-center gap-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--color-subtle)] md:hidden"
          >
            <span className="text-[var(--color-accent)]">[ ! ]</span>
            Best experienced on a desktop
          </motion.p>

        </div>

        {/* ── RIGHT: radial nav dial — smaller, vertically contained ── */}
        <motion.div
          className="relative z-40 hidden md:flex md:items-center md:justify-end"
          style={{ paddingTop: "6vh", paddingBottom: "6vh" }}
          initial={reduceMotion ? false : { opacity: 0, x: 60 }}
          animate={ready || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
          transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
        >
          {isDesktop &&
            (radialNav?.slot === "radial-navbar"
              ? radialNav.renderLive(RADIAL_NAV_CLASS)
              : <RadialNav className={RADIAL_NAV_CLASS} />)}
        </motion.div>
      </div>

      {/* Scroll hint & System Status Bottom Bar */}
      <motion.div
        {...fadeIn(0.5)}
        className="absolute bottom-6 left-6 right-6 z-50 flex items-end justify-between sm:bottom-10 sm:left-14 sm:right-14 lg:bottom-12 lg:left-16 lg:right-16"
      >
        <div className="flex flex-col gap-1.5">
          <span className="label-system text-[var(--color-subtle)]">SYS.STATUS</span>
          <span className="flex items-center gap-2 font-mono text-sm text-[var(--color-accent)]">
            <span className="inline-block h-3 w-px bg-[var(--color-accent)]" />
            ALL SYSTEMS NOMINAL
          </span>
        </div>

        <a
          href="#about"
          className="pointer-events-auto group flex flex-col items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          <span className="label-system text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-foreground)]">
            SCROLL
          </span>
          <span className="relative h-8 w-px overflow-hidden bg-[var(--color-border-strong)]">
            <motion.span
              className="absolute left-0 top-0 h-3 w-px bg-[var(--color-accent)]"
              animate={reduceMotion ? undefined : { y: [-12, 32] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </a>

        <div className="hidden sm:block md:-mb-2 lg:-mb-4">
          <LiveTime />
        </div>
      </motion.div>
    </section>
  );
}
