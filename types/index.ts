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
