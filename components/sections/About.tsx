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
  type Variants,
} from "framer-motion";

import { site, socials } from "@/constants/site";
import { about } from "@/constants/content";
import { Section } from "@/components/layout/Section";
import { SectionReveal } from "@/components/fx/SectionReveal";

/**
 * About — editorial narrative on the left, an interactive dithered-particle
 * panel on the right. The panel tilts in 3D toward the cursor while its inner
 * layers parallax against each other for depth.
 */

// Client-only WebGL particle field (dithered), SSR-safe.
const AboutField = dynamic(() => import("@/components/fx/AboutField"), {
  ssr: false,
});

const EASE = [0.22, 1, 0.36, 1] as const;

export function About() {
  return (
    <Section id="about" noChildReveal>
      <SectionReveal>
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-5 md:gap-12">
          <Narrative />
          <TiltPanel />
        </div>
      </SectionReveal>
    </Section>
  );
}

/* ─── Left: narrative ─────────────────────────────────────────────────────── */

function Narrative() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const item: Variants = {
    hidden: reduce ? {} : { opacity: 0, y: 24, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: EASE },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-6 md:col-span-3 md:mt-24 lg:mt-32"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.header variants={item} className="mb-2 flex flex-col gap-3 md:mb-6">
        <span className="label-system flex items-center gap-2">
          <span className="text-[var(--color-accent)]">01</span>
          <span className="h-px w-8 bg-[var(--color-border-strong)]" />
          about
        </span>
        <h2 className="font-display text-3xl font-medium tracking-tight text-[var(--color-foreground)] sm:text-5xl">
          About
        </h2>
      </motion.header>
      {about.bio.map((paragraph, i) => (
        <motion.p
          key={i}
          variants={item}
          className="text-balance text-base leading-relaxed text-[var(--color-muted)] sm:text-lg"
        >
          {renderBio(paragraph, site.name)}
        </motion.p>
      ))}

      {/* Compact meta line keeps identity present without a heavy table */}
      <motion.div
        variants={item}
        className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 label-system text-[var(--color-subtle)]"
      >
        <span>{site.location}</span>
        <span className="text-[var(--color-faint)]">/</span>
        <span>{site.role}</span>
        <span className="text-[var(--color-faint)]">/</span>
        <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
          <span className="inline-block size-1.5 rounded-full bg-[var(--color-online)]" />
          {site.available ? "Available for work" : "Currently booked"}
        </span>
      </motion.div>

      <motion.div variants={item} className="mt-2 flex flex-wrap gap-3">
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
      </motion.div>
    </motion.div>
  );
}

/* ─── Right: interactive tilt panel ───────────────────────────────────────── */

function TiltPanel() {
  const reduce = useReducedMotion();
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

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    animate(px, 0, { duration: 0.6, ease: EASE });
    animate(py, 0, { duration: 0.6, ease: EASE });
  }

  return (
    <motion.div
      className="md:col-span-2 md:mt-24 lg:mt-32 md:h-[22rem] lg:h-[26rem]"
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
