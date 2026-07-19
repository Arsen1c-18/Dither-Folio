import { NextResponse } from "next/server";

/**
 * GET /api/contributions — real GitHub contribution calendar via the
 * GraphQL API. Requires two env vars (set in .env.local / deploy env):
 *   GITHUB_TOKEN     — classic PAT with the read:user scope
 *   GITHUB_USERNAME  — the login whose calendar to show
 *
 * Returns { total, weeks } where weeks is number[][] (weeks × days),
 * the exact shape ContributionGraph renders. Responds 503 when the env
 * is missing or GitHub errors — the client falls back to seeded data.
 */

export const revalidate = 86400; // re-fetch at most once a day

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_USERNAME;

  if (!token || !login) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN / GITHUB_USERNAME not configured" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);

    const json = await res.json();
    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) throw new Error(json?.errors?.[0]?.message ?? "no calendar");

    return NextResponse.json({
      total: calendar.totalContributions as number,
      weeks: calendar.weeks.map(
        (w: { contributionDays: { contributionCount: number }[] }) =>
          w.contributionDays.map((d) => d.contributionCount),
      ) as number[][],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 503 },
    );
  }
}
