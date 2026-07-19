"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { socials } from "@/constants/site";
import { contact } from "@/constants/content";
import { HeroGlobe } from "@/components/fx/HeroGlobe";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Contact — no form, no boxes: the star-globe with every channel link
 * orbiting it on a circular path, like satellites. Scroll drives the whole
 * assembly: it zooms in gently and the orbit ring rotates a few degrees as
 * you move through the section, and the composition deliberately overhangs
 * the footer — the globe ends halfway over it, floating above the
 * wordmark strip. The HeroGlobe component itself is untouched.
 */

// Orbit radius as a fraction of the globe wrapper's half-size — links sit
// just outside the starfield's rim
const ORBIT = 1.08;

export function Contact() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll progress across the section's pass through the viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // The dynamic move: assembly zooms in a little as you scroll deeper,
  // and the orbit ring slowly turns. Springs keep both buttery. Zoom tops
  // out modestly so the scaled assembly stays inside its clearance.
  const scaleRaw = useTransform(scrollYProgress, [0, 0.35, 1], [0.85, 1, 1.06]);
  const orbitRaw = useTransform(scrollYProgress, [0, 1], [-14, 10]);
  const scale = useSpring(scaleRaw, { stiffness: 60, damping: 20 });
  const orbitTurn = useSpring(orbitRaw, { stiffness: 60, damping: 20 });
  // Links counter-rotate so they stay upright while the ring turns
  const counterTurn = useTransform(orbitTurn, (d: number) => -d);

  return (
    <section
      ref={sectionRef}
      id="contact"
      // Negative bottom margin hangs the globe's lower arc over the footer;
      // z-index floats it above the footer surface
      className="section-flow relative z-10 -mb-40 scroll-mt-20 sm:-mb-48"
    >
      {/* Ghost section index */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-24 select-none font-display font-bold leading-none text-transparent"
        style={{
          fontSize: "clamp(14rem, 30vw, 26rem)",
          WebkitTextStroke: "1px rgba(255,255,255,0.04)",
        }}
      >
        05
      </span>

      {/* ── Ambient star chart — concentric orbit rings radiating from the
          globe's position, faint star specks, and chart annotations ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Concentric orbit rings, centred where the globe sits */}
        {[
          { size: "min(60vw, 44rem)", dashed: false, opacity: 0.22 },
          { size: "min(78vw, 58rem)", dashed: true, opacity: 0.16 },
          { size: "min(98vw, 74rem)", dashed: false, opacity: 0.1 },
        ].map((ring) => (
          <div
            key={ring.size}
            className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border)]"
            style={{
              width: ring.size,
              height: ring.size,
              opacity: ring.opacity,
              borderStyle: ring.dashed ? "dashed" : "solid",
            }}
          />
        ))}
        {/* Scattered star specks */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><circle cx='24' cy='40' r='0.8' fill='white' opacity='0.5'/><circle cx='150' cy='22' r='0.6' fill='white' opacity='0.35'/><circle cx='196' cy='120' r='0.9' fill='white' opacity='0.45'/><circle cx='80' cy='170' r='0.5' fill='white' opacity='0.3'/><circle cx='120' cy='90' r='0.7' fill='white' opacity='0.25'/></svg>")`,
            maskImage:
              "radial-gradient(90% 85% at 50% 55%, black 20%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(90% 85% at 50% 55%, black 20%, transparent 100%)",
          }}
        />
        {/* Constellation crosses at chart corners */}
        <span className="absolute left-8 top-32 hidden font-mono text-[0.6rem] text-[var(--color-faint)] lg:block">
          +
        </span>
        <span className="absolute bottom-40 right-12 hidden font-mono text-[0.6rem] text-[var(--color-faint)] lg:block">
          +
        </span>
        <span className="absolute left-16 bottom-56 hidden font-mono text-[0.6rem] text-[var(--color-faint)] lg:block">
          +
        </span>
        {/* Chart annotation, vertical on the left edge */}
        <span
          className="absolute left-9 top-1/2 hidden -translate-y-1/2 select-none font-mono text-[0.55rem] tracking-[0.45em] text-[var(--color-faint)] lg:block"
          style={{ writingMode: "vertical-rl" }}
        >
          STAR CHART · SIGNAL RANGE ∞
        </span>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="container-page relative pb-24 pt-20 sm:pb-28 sm:pt-24 lg:pt-28"
      >
        {/* Section header */}
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-20 flex flex-col items-center gap-3 text-center sm:mb-24"
        >
          <span className="label-system flex items-center gap-2">
            <span className="text-[var(--color-accent)]">05</span>
            <span className="h-px w-8 bg-[var(--color-border-strong)]" />
            contact
          </span>
          <h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
            Contact<span className="text-[var(--color-accent)]">.</span>
          </h2>
        </motion.header>

        {/* ── Globe + orbiting links — one scroll-scaled assembly ── */}
        <motion.div
          style={reduceMotion ? undefined : { scale }}
          className="relative mx-auto flex w-fit flex-col items-center"
        >
          <div className="relative">
            <HeroGlobe className="size-[min(84vw,38rem)]" />

            {/* Orbit ring — a faint dashed circle the links ride on */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-[var(--color-border)] opacity-40"
              style={{ transform: `scale(${ORBIT})` }}
            />

            {/* The satellites: each link parked at its angle on the orbit.
                The whole ring rotates with scroll; each chip counter-rotates
                to stay upright. */}
            <motion.div
              style={reduceMotion ? undefined : { rotate: orbitTurn }}
              className="absolute inset-0"
            >
              {socials.map((s, i) => {
                // Distribute evenly, starting from the top
                const angle = -90 + (360 / socials.length) * i;
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 50 * ORBIT * Math.cos(rad);
                const y = 50 + 50 * ORBIT * Math.sin(rad);
                return (
                  <motion.div
                    key={s.label}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      ...(reduceMotion ? {} : { rotate: counterTurn }),
                    }}
                  >
                    <motion.a
                      href={s.href}
                      target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noreferrer"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.1 }}
                      className="group flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 whitespace-nowrap bg-[var(--color-bg)]/80 px-3 py-1.5 backdrop-blur-sm"
                    >
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-subtle)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                        {s.label}
                      </span>
                      <span className="text-xs text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-foreground)]">
                        {s.handle}
                      </span>
                    </motion.a>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Quote beneath the globe */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="pointer-events-none mt-20 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-subtle)] sm:mt-24"
          >
            {/* `·` separators from the CMS render in the accent colour */}
            {contact.quote.split("·").map((part, i, arr) => (
              <span key={i}>
                {part.trim()}
                {i < arr.length - 1 && (
                  <span className="text-[var(--color-accent)]"> · </span>
                )}
              </span>
            ))}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
