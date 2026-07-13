"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * Fixed top navigation. Glass surface fades in on scroll; anchors jump to the
 * matching section id. Availability dot reflects `site.available`.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "glass" : "bg-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#hero" className="font-display text-lg font-medium tracking-tight">
          {site.handle}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.slice(1).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block size-1.5 rounded-full",
              site.available ? "bg-[var(--color-online)]" : "bg-[var(--color-subtle)]",
            )}
          />
          <span className="label-system">
            {site.available ? "Available" : "Booked"}
          </span>
        </div>
      </nav>
    </header>
  );
}
