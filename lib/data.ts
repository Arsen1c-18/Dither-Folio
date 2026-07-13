import raw from "@/data/portfolio.json";
import type { PortfolioData } from "@/types";

/**
 * Single source of truth for all portfolio content and settings.
 *
 * `data/portfolio.json` is imported statically so it works in both server and
 * client components and is bundled at build time (prod is fully static). The
 * dev-only dashboard writes back to that JSON via /api/admin/save; changes are
 * picked up on the next dev reload.
 */
export const data = raw as PortfolioData;

export default data;
