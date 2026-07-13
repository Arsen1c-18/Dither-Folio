/** Shared domain types for portfolio content. */

export interface NavItem {
  label: string;
  id: string;
}

export interface Social {
  label: string;
  href: string;
  handle: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  period: string;
  current?: boolean;
  summary: string;
}

export type ProjectCategory = "ai-ml" | "web-apps" | "tools";

export interface Project {
  id: string;
  title: string;
  description: string;
  year: string;
  category: ProjectCategory;
  stack: string[];
  href?: string;
}

export interface Skill {
  name: string;
  level: number; // 0–100
  category: string;
}

export interface SiteInfo {
  name: string;
  handle: string;
  role: string;
  tagline: string;
  location: string;
  timezone: string;
  email: string;
  available: boolean;
  resumeUrl: string;
  metadataBase: string;
}

export interface Theme {
  accent: string;
  accentBright: string;
  accentDim: string;
}

/** One tuning preset for the Dither shader. */
export interface FxPreset {
  waveSpeed: number;
  waveFrequency: number;
  waveAmplitude: number;
  waveColor: [number, number, number];
  colorNum: number;
  pixelSize: number;
  enableMouseInteraction: boolean;
  mouseRadius: number;
}

export type FxPresetName = "hero" | "panel" | "strip";

export type Fx = Record<FxPresetName, FxPreset>;

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutContent {
  /** Paragraphs; the token `{name}` is replaced with the owner's name. */
  bio: string[];
  stats: AboutStat[];
}

/** The full editable portfolio dataset — mirrors data/portfolio.json. */
export interface PortfolioData {
  site: SiteInfo;
  socials: Social[];
  nav: NavItem[];
  theme: Theme;
  fx: Fx;
  about: AboutContent;
  experience: ExperienceItem[];
  projects: Project[];
  skills: Skill[];
}
