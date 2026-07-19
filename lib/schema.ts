import { z } from "zod";

/**
 * Runtime validation for the editable portfolio dataset.
 * Used by /api/admin/save to reject malformed writes before they touch
 * data/portfolio.json. Mirrors the `PortfolioData` type in @/types.
 */

const socialSchema = z.object({
  label: z.string(),
  href: z.string(),
  handle: z.string(),
});

const navItemSchema = z.object({
  label: z.string(),
  id: z.string(),
});

const fxPresetSchema = z.object({
  waveSpeed: z.number(),
  waveFrequency: z.number(),
  waveAmplitude: z.number(),
  waveColor: z.tuple([z.number(), z.number(), z.number()]),
  colorNum: z.number(),
  pixelSize: z.number(),
  enableMouseInteraction: z.boolean(),
  mouseRadius: z.number(),
});

const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string(),
  org: z.string(),
  period: z.string(),
  current: z.boolean().optional(),
  summary: z.string(),
});

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  year: z.string(),
  category: z.enum(["ai-ml", "web-apps", "tools"]),
  stack: z.array(z.string()),
  href: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string(),
  level: z.number().min(0).max(100),
  category: z.string(),
});

export const portfolioSchema = z.object({
  site: z.object({
    name: z.string(),
    handle: z.string(),
    role: z.string(),
    tagline: z.string(),
    location: z.string(),
    timezone: z.string(),
    email: z.string(),
    available: z.boolean(),
    resumeUrl: z.string(),
    metadataBase: z.string(),
  }),
  socials: z.array(socialSchema),
  nav: z.array(navItemSchema),
  theme: z.object({
    accent: z.string(),
    accentBright: z.string(),
    accentDim: z.string(),
  }),
  fx: z.object({
    hero: fxPresetSchema,
    panel: fxPresetSchema,
    strip: fxPresetSchema,
  }),
  /** Dashboard wiring (e.g. which library element is live in the navbar). */
  ui: z.object({ navbarBot: z.string(), radialNavbar: z.string().optional() }).optional(),
  about: z.object({
    bio: z.array(z.string()),
    stats: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  experience: z.array(experienceItemSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
});

export type PortfolioSchema = z.infer<typeof portfolioSchema>;
