"use client";

import { useEffect, useState } from "react";
import { site, socials, nav } from "@/constants/site";
import { footer } from "@/constants/content";
import { DitherBackground } from "@/components/fx/DitherBackground";

/**
 * Footer — the document's colophon. The hero's dither shader returns as a
 * faded backdrop (closing the page on the texture it opened with), over
 * which sits a three-column console (navigate / channels / status with a
 * live local-time readout) and an END-OF-FILE strip. The contact globe
 * hangs over the top of this footer, so the upper padding is part of the
 * composition.
 */
export function Footer() {
  const year = "2026";

  return (
    <footer className="relative overflow-hidden">
      {/* Hero dither shader, heavily faded — builds gradually from nothing
          at the very top of the footer to full strength at the bottom edge,
          so the page dissolves into the texture instead of hitting a seam.
          The scrim plus low opacity keeps the console text readable. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 65%, transparent 100%)",
        }}
      >
        <DitherBackground preset="hero" overlay={0.55} enableMouseInteraction={false} />
      </div>

      {/* Warm glow rising from the bottom edge — taller and softer so it
          participates in the same gradual build */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 115%, rgba(255,59,59,0.06) 0%, rgba(255,59,59,0.02) 45%, transparent 75%)",
        }}
      />

      {/* Top padding clears the contact globe's lower arc, which hangs
          over this footer */}
      <div className="container-page relative flex flex-col gap-14 pb-8 pt-72 sm:pt-80">
        {/* ── Console: three columns ── */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          {/* Navigate */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-faint)]">
              Navigate
            </span>
            <ul className="flex flex-col gap-2.5">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="group inline-flex items-center gap-2 text-sm text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)]"
                  >
                    <span className="h-px w-0 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-3" />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Channels */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-faint)]">
              Channels
            </span>
            <ul className="flex flex-col gap-2.5">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    className="group inline-flex items-baseline gap-2 text-sm text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)]"
                  >
                    {s.label}
                    <span className="font-mono text-[0.6rem] text-[var(--color-subtle)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                      {"↗︎"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[var(--color-faint)]">
              Status
            </span>
            <ul className="flex flex-col gap-2.5 font-mono text-[0.68rem] tracking-[0.08em] text-[var(--color-muted)]">
              <li className="flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-[var(--color-online)]" />
                {site.available ? "Open to new projects" : "Currently booked"}
              </li>
              <li>
                LOCAL <LocalTime /> — {site.location}
              </li>
              <li className="text-[var(--color-subtle)]">
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-300 hover:text-[var(--color-accent)]"
                >
                  résumé.pdf ↓
                </a>
              </li>
            </ul>
            <BackToTop />
          </div>
        </div>

        {/* ── END OF FILE strip ── */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--color-border)] pt-5 font-mono text-[0.6rem] tracking-[0.18em] text-[var(--color-subtle)]">
          <span>
            © {year} <span className="text-[var(--color-muted)]">{site.name}</span>
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <span className="h-px w-8 bg-[var(--color-border-strong)]" />
            {footer.eof}
            <span className="h-px w-8 bg-[var(--color-border-strong)]" />
          </span>
          <span>{footer.credit}</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── elements ────────────────────────────────────────────────────────────── */

/** Live clock in the site's own timezone. Renders a placeholder until
 *  mounted so server and client markup never disagree. */
function LocalTime() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: site.timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-[var(--color-foreground)]">{time}</span>;
}

/** Return-to-top control, styled like the rest of the console. */
function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group mt-2 inline-flex w-fit items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)]"
    >
      <span className="flex size-7 items-center justify-center border border-[var(--color-border-strong)] transition-colors duration-300 group-hover:border-[var(--color-accent)]/60">
        <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
          ↑
        </span>
      </span>
      Back to top
    </button>
  );
}
