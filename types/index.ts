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
  /** Human-readable length of the stint, e.g. "6 months". */
  duration?: string;
  current?: boolean;
  summary: string;
  /** Skills developed during this role, rendered as chips. */
  skills?: string[];
  /** Notable wins during this role, e.g. "1st — Build with AI Hackathon". */
  achievements?: string[];
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
  /** Image path/URL for the card's right panel (e.g. "/projects/x.png").
   *  Empty falls back to the conventional /projects/{id}.png, then to the
   *  numbered blueprint placeholder. */
  image?: string;
}

export interface Skill {
  name: string;
  level: number; // 0–100
  category: string;
  /** Simple Icons slug (simpleicons.org), e.g. "typescript". Empty = monogram tile. */
  icon?: string;
  /** When true, the skill stays in the data but is not rendered on the site. */
  hidden?: boolean;
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
  /** Optional full palette — when set, overrides the static tokens in
   *  globals.css site-wide. Absent keys fall back to the CSS defaults. */
  bg?: string;
  surface?: string;
  surface2?: string;
  elevated?: string;
  foreground?: string;
  muted?: string;
  subtle?: string;
  faint?: string;
  online?: string;
  /** White-line border opacities (0–1). */
  borderOpacity?: number;
  borderStrongOpacity?: number;
}

/** Contact-section copy. */
export interface ContactContent {
  /** Quote under the globe. `·` separators render in the accent color. */
  quote?: string;
}

/** Footer copy. */
export interface FooterContent {
  /** Closing credit on the right of the EOF strip, e.g. "BUILT BY HAND". */
  credit?: string;
  /** Centre marker label of the closing strip. */
  eof?: string;
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

/** UI wiring choices made in the dashboard (e.g. which library element is live). */
export interface UiConfig {
  /** Library element id rendered at the radial nav hub. */
  navbarBot: string;
  /** Library radial navbar id rendered in the hero. */
  radialNavbar?: string;
}

/** The full editable portfolio dataset — mirrors data/portfolio.json. */
export interface PortfolioData {
  site: SiteInfo;
  socials: Social[];
  nav: NavItem[];
  theme: Theme;
  fx: Fx;
  /** Optional — defaults are applied when absent from the JSON. */
  ui?: UiConfig;
  about: AboutContent;
  /** Optional — sections fall back to built-in copy when absent. */
  contact?: ContactContent;
  footer?: FooterContent;
  experience: ExperienceItem[];
  projects: Project[];
  skills: Skill[];
}
