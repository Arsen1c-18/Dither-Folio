"use client";

import { useEffect, useRef } from "react";
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
import { useIsMobile } from "@/lib/useIsMobile";

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

// Default NOW block copy — overridden by `about.now` from the dashboard.
const NOW_FALLBACK = [
  { label: "NOW", value: "Building scalable backend systems" },
  { label: "LEARNING", value: "LLM infra & retrieval systems" },
  { label: "OFF-HOURS", value: "PL theory papers & WebGL generative art" },
];

export function About() {
  const reduce = useReducedMotion();
  return (
    <Section
      id="about"
      noChildReveal
      className="relative flex min-h-screen flex-col justify-center overflow-hidden py-16 sm:py-16"
    >
      <ArcBackdrop />

      <motion.div
        className="relative"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <DossierHeader />

        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-5 md:gap-12">
          <Narrative />
          <TiltPanel />
        </div>

        <NowBlock />
        <SocialLinks />
      </motion.div>
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
        {/* Tick marks on the outer ring. Coordinates are rounded to fixed
            precision: raw Math.cos/sin output differs in the last float
            digits between the server and some browsers, which trips React
            hydration on the rendered attribute strings. */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = (400 + Math.cos(a) * 388).toFixed(2), y1 = (400 + Math.sin(a) * 388).toFixed(2);
          const x2 = (400 + Math.cos(a) * 396).toFixed(2), y2 = (400 + Math.sin(a) * 396).toFixed(2);
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
  const now = about.now && about.now.length > 0 ? about.now : NOW_FALLBACK;
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3 md:mt-16">
      {now.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-1.5 ${
            i === 1
              ? "sm:items-center sm:text-center"
              : i === now.length - 1
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
          <span className="label-system shrink-0 whitespace-nowrap">{s.label}</span>
          <span className="whitespace-nowrap text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-accent)]">
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

function TiltPanel() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

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

  // rAF-gated: one rect read + MotionValue update per frame, no matter how
  // fast the pointer events arrive. Skipped on touch — pointermove there
  // fires during scroll drags and tilts the card mid-scroll.
  const moveFrame = useRef(0);
  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || isMobile || !ref.current || moveFrame.current) return;
    const { clientX, clientY } = e;
    moveFrame.current = requestAnimationFrame(() => {
      moveFrame.current = 0;
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      px.set((clientX - rect.left) / rect.width - 0.5);
      py.set((clientY - rect.top) / rect.height - 0.5);
    });
  }
  useEffect(() => () => cancelAnimationFrame(moveFrame.current), []);

  function handleLeave() {
    cancelAnimationFrame(moveFrame.current);
    moveFrame.current = 0;
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
        onPointerLeave={handleLeave}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-border-strong)] sm:aspect-[3/4] md:aspect-auto md:h-full md:min-h-[22rem] lg:min-h-[26rem]"
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Depth layer 1 — dithered particle field (recedes).
            On phones the WebGL field is skipped for a static gradient wash:
            the tilt interaction it parallaxes against doesn't exist there. */}
        <motion.div
          aria-hidden
          className="absolute -inset-6"
          style={{
            x: reduce ? 0 : fieldX,
            y: reduce ? 0 : fieldY,
            translateZ: -40,
          }}
        >
          {isMobile ? (
            <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,rgba(255,59,59,0.14),transparent_75%)] bg-[var(--color-surface)]" />
          ) : (
            <AboutField />
          )}
        </motion.div>

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
