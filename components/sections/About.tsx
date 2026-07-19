"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  animate,
} from "framer-motion";

import { site, socials } from "@/constants/site";
import { about } from "@/constants/content";
import { Section } from "@/components/layout/Section";

/**
 * About — a full-screen "personnel dossier": blueprint grid backdrop,
 * mono file header, line-numbered bio on the left, interactive
 * dithered-particle identity panel on the right, and a NOW block +
 * centered socials underneath.
 */

// Client-only WebGL particle field (dithered), SSR-safe.
const AboutField = dynamic(() => import("@/components/fx/AboutField"), {
  ssr: false,
});

const EASE = [0.22, 1, 0.36, 1] as const;

// Edit these to update the NOW block (not dashboard-managed).
const NOW = [
  { label: "NOW", value: "Building scalable backend systems" },
  { label: "LEARNING", value: "LLM infra & retrieval systems" },
  { label: "OFF-HOURS", value: "PL theory papers & WebGL generative art" },
];

export function About() {
  return (
    <Section
      id="about"
      noChildReveal
      className="relative flex min-h-screen flex-col justify-center overflow-hidden py-16 sm:py-16"
    >
      <ArcBackdrop />

      <div className="relative">
        <DossierHeader />

        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-5 md:gap-12">
          <Narrative />
          <TiltPanel />
        </div>

        <NowBlock />
        <SocialLinks />
      </div>
    </Section>
  );
}

/* ─── Backdrop — sweeping arcs + faint section index, dial/instrument style ── */

function ArcBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Giant faint section index anchored off the right edge */}
      <span
        className="absolute -right-8 top-1/2 -translate-y-1/2 select-none font-display font-bold leading-none text-transparent"
        style={{
          fontSize: "clamp(16rem, 34vw, 30rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.045)",
        }}
      >
        01
      </span>

      {/* Concentric arc fragments sweeping in from the left, echoing the radial nav */}
      <svg
        className="absolute -left-[28rem] top-1/2 h-[56rem] w-[56rem] -translate-y-1/2"
        viewBox="0 0 800 800"
        fill="none"
      >
        <circle cx="400" cy="400" r="396" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle
          cx="400" cy="400" r="330"
          stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          strokeDasharray="4 14"
        />
        <circle cx="400" cy="400" r="230" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* Accent arc segment */}
        <path
          d="M 400 4 A 396 396 0 0 1 740 200"
          stroke="var(--color-accent)" strokeWidth="1" opacity="0.25"
        />
        {/* Tick marks on the outer ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 400 + Math.cos(a) * 388, y1 = 400 + Math.sin(a) * 388;
          const x2 = 400 + Math.cos(a) * 396, y2 = 400 + Math.sin(a) * 396;
          return (
            <line
              key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.10)" strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Dossier file header ─────────────────────────────────────────────────── */

function DossierHeader() {
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-[var(--color-border-strong)] py-2.5 font-mono text-[0.65rem] tracking-[0.15em] text-[var(--color-subtle)] md:mb-14">
      <span>
        FILE: <span className="text-[var(--color-foreground)]">ABOUT.MD</span>
      </span>
      <span className="hidden sm:inline">LOC: {site.location.toUpperCase()}</span>
      <span className="hidden md:inline">ROLE: {site.role.toUpperCase()}</span>
      <span className="flex items-center gap-2">
        STATUS:
        <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
          <span className="size-1 rounded-full bg-[var(--color-accent)] animate-pulse" />
          {site.available ? "OPEN TO WORK" : "BOOKED"}
        </span>
      </span>
    </div>
  );
}

/* ─── Left: line-numbered narrative ───────────────────────────────────────── */

function Narrative() {
  return (
    <div className="flex flex-col gap-6 md:col-span-3">
      <header className="mb-2 flex flex-col gap-3 md:mb-4">
        <span className="label-system flex items-center gap-2">
          <span className="text-[var(--color-accent)]">01</span>
          <span className="h-px w-8 bg-[var(--color-border-strong)]" />
          about
        </span>
        <h2 className="font-display text-3xl font-medium tracking-tight text-[var(--color-foreground)] sm:text-5xl">
          About
        </h2>
      </header>

      {about.bio.map((paragraph, i) => (
        <div key={i} className="flex gap-4">
          <span
            className="select-none pt-1 font-mono text-[0.65rem] leading-relaxed text-[var(--color-faint)]"
            aria-hidden
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-balance text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {renderBio(paragraph, site.name)}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── NOW block — current focus, mono dossier styling ─────────────────────── */

function NowBlock() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3 md:mt-16">
      {NOW.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-1.5 ${
            i === 1
              ? "sm:items-center sm:text-center"
              : i === NOW.length - 1
                ? "sm:items-end sm:text-right"
                : ""
          }`}
        >
          <span className="label-system text-[0.6rem] text-[var(--color-accent)]">
            {item.label}
          </span>
          <span className="font-mono text-sm text-[var(--color-muted)]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Socials + resume — centered under everything ────────────────────────── */

function SocialLinks() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:mt-12">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-xs text-[var(--color-muted)] transition-all hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]"
        >
          <span className="label-system w-12">{s.label}</span>
          <span className="text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
            {s.handle}
          </span>
        </a>
      ))}
      <a
        href={site.resumeUrl}
        className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-[#050505] transition-colors hover:bg-[var(--color-accent-bright)]"
      >
        Resume ↗
      </a>
    </div>
  );
}

/* ─── Right: interactive tilt panel ───────────────────────────────────────── */

// Drop your photo at public/me.jpg (or change this path). The card shows it
// dithered on hover; if the file is missing the hover layer simply stays off.
const PORTRAIT_SRC = "/me.png";

// Bayer-style checker tile — overlaid on the photo to fake an ordered dither
const DITHER_TILE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><rect width='1' height='1' x='0' y='0' fill='black'/><rect width='1' height='1' x='2' y='2' fill='black'/><rect width='1' height='1' x='2' y='0' fill='black' opacity='0.5'/><rect width='1' height='1' x='0' y='2' fill='black' opacity='0.5'/></svg>")`;

// Blend mask: radial core intersected with per-edge linear fades so all
// four sides of the photo dim out evenly into the field
const PORTRAIT_MASK = [
  "radial-gradient(46% 44% at 50% 42%, black 28%, rgba(0,0,0,0.55) 58%, transparent 85%)",
  "linear-gradient(to bottom, transparent 12%, black 32%, black 68%, transparent 88%)",
  "linear-gradient(to right, transparent 18%, black 36%, black 64%, transparent 82%)",
].join(", ");
const PORTRAIT_MASK_COMPOSITE = "intersect";

function TiltPanel() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [portraitOk, setPortraitOk] = useState(false);

  // Probe for the portrait once so a missing file never flashes a broken image.
  useEffect(() => {
    const img = new Image();
    img.onload = () => setPortraitOk(true);
    img.src = PORTRAIT_SRC;
  }, []);

  // Pointer position, normalised to [-0.5, 0.5] over the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Springed tilt for smoothness.
  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), spring);

  // Parallax offsets for the inner layers (opposite directions = depth).
  const fieldX = useSpring(useTransform(px, [-0.5, 0.5], [-18, 18]), spring);
  const fieldY = useSpring(useTransform(py, [-0.5, 0.5], [-18, 18]), spring);
  const contentX = useSpring(useTransform(px, [-0.5, 0.5], [10, -10]), spring);
  const contentY = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    setHovered(false);
    animate(px, 0, { duration: 0.6, ease: EASE });
    animate(py, 0, { duration: 0.6, ease: EASE });
  }

  return (
    <motion.div
      className="md:col-span-2 md:h-[22rem] lg:h-[26rem]"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={handleLeave}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-border-strong)] sm:aspect-[3/4] md:aspect-auto md:h-full md:min-h-[22rem] lg:min-h-[26rem]"
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Depth layer 1 — dithered particle field (recedes) */}
        <motion.div
          aria-hidden
          className="absolute -inset-6"
          style={{
            x: reduce ? 0 : fieldX,
            y: reduce ? 0 : fieldY,
            translateZ: -40,
          }}
        >
          <AboutField />
        </motion.div>

        {/* Dithered portrait — dissolves into the field on hover */}
        {portraitOk && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ translateZ: -20 }}
          >
            <div
              className={`absolute inset-0 ${reduce ? "" : "portrait-jitter"}`}
              style={{
                backgroundImage: `url(${PORTRAIT_SRC})`,
                backgroundSize: "auto 62%",
                backgroundPosition: "center 42%",
                backgroundRepeat: "no-repeat",
                maskImage: PORTRAIT_MASK,
                WebkitMaskImage: PORTRAIT_MASK,
                maskComposite: PORTRAIT_MASK_COMPOSITE,
                WebkitMaskComposite: "source-in",
                mixBlendMode: "lighten",
              }}
            />
            {/* Dither texture — 1px stepped jitter makes it constantly re-rasterize */}
            <div
              className={`absolute inset-0 opacity-50 ${reduce ? "" : "dither-flicker"}`}
              style={{
                backgroundImage: DITHER_TILE,
                backgroundSize: "4px 4px",
                maskImage: PORTRAIT_MASK,
                WebkitMaskImage: PORTRAIT_MASK,
                maskComposite: PORTRAIT_MASK_COMPOSITE,
                WebkitMaskComposite: "source-in",
              }}
            />
          </motion.div>
        )}

        {/* Legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(5,5,5,0.35),rgba(5,5,5,0.82))]" />

        {/* Depth layer 2 — content (comes forward) */}
        <motion.div
          className="relative flex h-full flex-col justify-between gap-8 p-6 sm:p-8"
          style={{
            x: reduce ? 0 : contentX,
            y: reduce ? 0 : contentY,
            translateZ: 30,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="label-system text-[var(--color-subtle)]">
                Identity
              </span>
              <span className="font-display text-3xl font-medium tracking-tight text-[var(--color-foreground)] sm:text-4xl">
                {site.handle}
              </span>
            </div>
            <span className="label-system text-[var(--color-accent)]">01</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {about.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-display text-2xl font-medium text-[var(--color-foreground)] sm:text-3xl">
                  <CountUp value={s.value} />
                </span>
                <span className="label-system text-[0.625rem] leading-tight text-[var(--color-subtle)]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Count-up stat ───────────────────────────────────────────────────────── */

function CountUp({ value }: { value: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  // Split into a leading number and any suffix (e.g. "300+" → 300 + "+").
  const match = value.match(/^(\d+)(.*)$/);

  useEffect(() => {
    if (!match || !inView || reduce || !ref.current) return;
    const node = ref.current;
    const suffix = match[2];
    const controls = animate(0, Number(match[1]), {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, match]);

  // Non-numeric values (e.g. "∞") render as-is; numeric ones start at 0.
  const initial = match && !reduce ? `0${match[2]}` : value;
  return <span ref={ref}>{initial}</span>;
}

/* ─── Bio name-token rendering (unchanged behaviour) ──────────────────────── */

function renderBio(paragraph: string, name: string): React.ReactNode {
  const parts = paragraph.split("{name}");
  if (parts.length === 1) return paragraph;

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <strong className="font-medium text-[var(--color-foreground)]">
          {name}
        </strong>
      )}
    </span>
  ));
}
