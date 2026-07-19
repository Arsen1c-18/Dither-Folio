/**
 * Portfolio content — experience, projects, skills, about.
 *
 * Sourced from data/portfolio.json (edited via the dev-only dashboard) and
 * re-exported here so components can keep importing from `@/constants/content`.
 */
import { data } from "@/lib/data";

export const experience = data.experience;
/** Standalone achievements for the commendation card. */
export const achievements = data.achievements ?? [];
export const projects = data.projects;
export const skills = data.skills;
export const about = data.about;

/** Contact + footer copy, with built-in fallbacks for older JSON. */
export const contact = {
  quote: data.contact?.quote || "Somewhere on this sphere · probably shipping",
};
export const footer = {
  credit: data.footer?.credit || "BUILT BY HAND",
  eof: data.footer?.eof || "EOF",
};
