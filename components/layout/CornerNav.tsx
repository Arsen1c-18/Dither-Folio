"use client";

import { useEffect, useState } from "react";
import { nav, site, socials } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * Corner-anchored navigation — no bar. Logo top-left, links + availability
 * top-right, socials bottom-left. Fades to a compact glass chip on scroll.
 */
export function CornerNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* top-left: logo */}
      <a
        href="#hero"
        className={cn(
          "fixed left-6 top-6 z-50 font-display text-lg font-medium tracking-tight transition-opacity sm:left-10 sm:top-8",
          scrolled && "opacity-60 hover:opacity-100",
        )}
      >
        {site.handle}
        <span className="text-[var(--color-accent)]">.</span>
      </a>

      {/* top-right: links + availability */}
      <div
        className={cn(
          "fixed right-6 top-6 z-50 flex items-center gap-6 sm:right-10 sm:top-8",
          scrolled && "rounded-full px-4 py-2 glass",
        )}
      >
        <ul className="hidden items-center gap-5 md:flex">
          {nav.slice(1).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="label-system text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full",
              site.available ? "bg-[var(--color-online)]" : "bg-[var(--color-subtle)]",
            )}
          />
          <span className="label-system">{site.available ? "Available" : "Booked"}</span>
        </span>
      </div>

      {/* bottom-left: socials */}
      <div className="fixed bottom-6 left-6 z-50 hidden flex-col gap-2 sm:bottom-8 sm:left-10 lg:flex">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="label-system text-[var(--color-subtle)] transition-colors hover:text-[var(--color-foreground)]"
          >
            {s.label}
          </a>
        ))}
      </div>
    </>
  );
}
