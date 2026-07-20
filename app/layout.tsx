import type { Metadata, Viewport } from "next";
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

/* Pin the layout viewport to the device width — without this, phones fall
   back to the 980px legacy viewport and render the whole page "zoomed out" */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

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
 * Theme injected as inline CSS vars so the dev-only dashboard's saved palette
 * overrides the static tokens in globals.css (inline style wins over the
 * `:root` rule). Accent is always present; the extended palette keys are
 * optional and only injected when set, so absent keys keep the CSS defaults.
 */
const themeVars = {
  "--color-accent": theme.accent,
  "--color-accent-bright": theme.accentBright,
  "--color-accent-dim": theme.accentDim,
  ...(theme.bg && { "--color-bg": theme.bg }),
  ...(theme.surface && { "--color-surface": theme.surface }),
  ...(theme.surface2 && { "--color-surface-2": theme.surface2 }),
  ...(theme.elevated && { "--color-elevated": theme.elevated }),
  ...(theme.foreground && { "--color-foreground": theme.foreground }),
  ...(theme.muted && { "--color-muted": theme.muted }),
  ...(theme.subtle && { "--color-subtle": theme.subtle }),
  ...(theme.faint && { "--color-faint": theme.faint }),
  ...(theme.online && { "--color-online": theme.online }),
  ...(theme.borderOpacity != null && {
    "--color-border": `rgba(255,255,255,${theme.borderOpacity})`,
  }),
  ...(theme.borderStrongOpacity != null && {
    "--color-border-strong": `rgba(255,255,255,${theme.borderStrongOpacity})`,
  }),
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
