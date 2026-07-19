"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/constants/site";
import { cn } from "@/lib/utils";

const SECTION_ITEMS = nav.slice(1);

/**
 * Shared section navigation. It appears once the Hero has scrolled away, so
 * the Hero's radial navigation remains its own distinct interaction.
 */
export function Navbar() {
  const [pastHero, setPastHero] = useState(false);
  const [activeId, setActiveId] = useState(SECTION_ITEMS[0]?.id ?? "");

  useEffect(() => {
    const updateNavigation = () => {
      const hero = document.getElementById("hero");
      setPastHero((hero?.getBoundingClientRect().bottom ?? 0) <= 0);

      const focusLine = window.innerHeight * 0.35;
      const activeSection = SECTION_ITEMS.find((item) => {
        const section = document.getElementById(item.id);
        if (!section) return false;
        const { top, bottom } = section.getBoundingClientRect();
        return top <= focusLine && bottom > focusLine;
      });

      if (activeSection) setActiveId(activeSection.id);
    };

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);
    return () => {
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-500 sm:top-6",
        pastHero ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
      )}
      aria-hidden={!pastHero}
    >
      <nav className="pointer-events-auto flex h-12 max-w-full items-center gap-3 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg)]/80 py-1.5 pl-4 pr-2 shadow-[0_12px_36px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:gap-5 sm:pl-5 sm:pr-3">
        <a
          href="#hero"
          className="shrink-0 font-display text-sm font-medium tracking-tight text-[var(--color-foreground)] sm:text-base"
        >
          <span className="hidden sm:inline">{site.handle}</span>
          <span className="sm:hidden">TOP</span>
        </a>

        <span className="h-4 w-px shrink-0 bg-[var(--color-border-strong)]" aria-hidden />

        <ul className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] sm:gap-2">
          {SECTION_ITEMS.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] transition-colors sm:px-2.5",
                  activeId === item.id
                    ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                <span className="hidden text-[0.55rem] opacity-70 lg:inline">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

      </nav>
    </header>
  );
}
