import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { site, theme } from "@/constants/site";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
  metadataBase: new URL(site.metadataBase),
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    type: "website",
  },
};

/**
 * Accent theme injected as inline CSS vars so the dev-only dashboard's saved
 * accent overrides the static tokens in globals.css (inline style wins over
 * the `:root` rule). Everything else stays in globals.css.
 */
const themeVars = {
  "--color-accent": theme.accent,
  "--color-accent-bright": theme.accentBright,
  "--color-accent-dim": theme.accentDim,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={themeVars} suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} film-grain antialiased`}
      >
        <SmoothScroll />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
