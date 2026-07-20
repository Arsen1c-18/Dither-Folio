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
  // Below md there is no radial nav in the hero, so this navbar is the only
  // navigation — keep it visible from the start on small screens
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeId, setActiveId] = useState(SECTION_ITEMS[0]?.id ?? "");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktop(mq.matches);
    updateViewport();
    mq.addEventListener("change", updateViewport);

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
      mq.removeEventListener("change", updateViewport);
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  const visible = pastHero || !isDesktop;

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-500 sm:top-6",
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <nav className="pointer-events-auto flex h-10 min-w-0 max-w-full items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg)]/80 py-1 pl-3 pr-1.5 shadow-[0_12px_36px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:h-12 sm:gap-5 sm:py-1.5 sm:pl-5 sm:pr-3">
        <a
          href="#hero"
          className="shrink-0 font-display text-xs font-medium tracking-tight text-[var(--color-foreground)] sm:text-base"
        >
          <span className="hidden sm:inline">{site.handle}</span>
          <span className="sm:hidden">TOP</span>
        </a>

        <span className="h-3.5 w-px shrink-0 bg-[var(--color-border-strong)] sm:h-4" aria-hidden />

        <ul className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2">
          {SECTION_ITEMS.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.05em] transition-colors sm:px-2.5 sm:text-[0.65rem] sm:tracking-[0.1em]",
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
