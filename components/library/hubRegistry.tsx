"use client";

import { AsciiPet } from "@/components/library/AsciiPet";
import { AsciiScope } from "@/components/library/AsciiScope";
import { BlobPal } from "@/components/library/BlobPal";
import { CatLoaf } from "@/components/library/CatLoaf";
import { FlightBoard } from "@/components/library/FlightBoard";
import { GhostBuddy } from "@/components/library/GhostBuddy";
import { HeartButton } from "@/components/library/HeartButton";
import { PixelInvader } from "@/components/library/PixelInvader";
import { RadarScope } from "@/components/library/RadarScope";
import { RadialBot } from "@/components/library/RadialBot";
import { SpinnerBot } from "@/components/library/SpinnerBot";

export type LibraryVibe = "cute" | "techy" | "aesthetic";

/** Entries designed for the foreground hub inside a radial navbar. */
export type HubLibraryEntry = {
  id: string;
  name: string;
  vibe: LibraryVibe;
  file: string;
  description: string;
  slot: "navbar-pets";
  stageClass?: string;
  render: () => React.ReactNode;
  renderNavbar?: () => React.ReactNode;
};

export const HUB_LIBRARY: HubLibraryEntry[] = [
  {
    id: "radial-bot", name: "Radial Nav bot", vibe: "techy", file: "components/library/RadialBot.tsx",
    description: "Animated ASCII bot that cycles frames with a gentle bounce.", slot: "navbar-pets", render: () => <RadialBot />,
  },
  {
    id: "ascii-pet", name: "ASCII Pet", vibe: "cute", file: "components/library/AsciiPet.tsx",
    description: "Tiny kaomoji critter that idles, blinks, and gets excited on hover.", slot: "navbar-pets", render: () => <AsciiPet />,
  },
  {
    id: "heart-button", name: "Heart Button", vibe: "cute", file: "components/library/HeartButton.tsx",
    description: "Like-button that bursts tiny hearts when toggled on.", slot: "navbar-pets", render: () => <HeartButton />,
  },
  {
    id: "ghost-buddy", name: "Ghost Buddy", vibe: "cute", file: "components/library/GhostBuddy.tsx",
    description: "A little ghost that bobs, blinks, and glances side to side.", slot: "navbar-pets", render: () => <GhostBuddy />,
  },
  {
    id: "cat-loaf", name: "Cat Loaf", vibe: "cute", file: "components/library/CatLoaf.tsx",
    description: "ASCII cat in loaf position. Blinks slowly and purrs on hover.", slot: "navbar-pets", render: () => <CatLoaf />,
  },
  {
    id: "spinner-bot", name: "Spinner Bot", vibe: "techy", file: "components/library/SpinnerBot.tsx",
    description: "Boxy robot head with a spinning antenna and scanning sensor eye.", slot: "navbar-pets", render: () => <SpinnerBot />,
  },
  {
    id: "blob-pal", name: "Blob Pal", vibe: "cute", file: "components/library/BlobPal.tsx",
    description: "Gooey accent blob that breathes and squishes; its eyes follow the cursor.", slot: "navbar-pets", render: () => <BlobPal />,
  },
  {
    id: "pixel-invader", name: "Pixel Invader", vibe: "techy", file: "components/library/PixelInvader.tsx",
    description: "Space-invader sprite with two marching poses and an occasional glitch.", slot: "navbar-pets", render: () => <PixelInvader />,
  },
  {
    id: "ascii-scope", name: "ASCII Oscilloscope", vibe: "techy", file: "components/library/AsciiScope.tsx",
    description: "Text-only oscilloscope trace with a scrolling fake voltage readout.", slot: "navbar-pets",
    render: () => <AsciiScope />, renderNavbar: () => <AsciiScope label="CH1" className="scale-[0.55]" />,
  },
  {
    id: "radar-scope", name: "Radar Scope", vibe: "aesthetic", file: "components/library/RadarScope.tsx",
    description: "Sweeping radar with labeled contacts that blip as the beam passes.", slot: "navbar-pets", stageClass: "p-8",
    render: () => <RadarScope />, renderNavbar: () => <RadarScope size={120} contacts={[]} />,
  },
  {
    id: "flight-board", name: "Flight Board", vibe: "aesthetic", file: "components/library/FlightBoard.tsx",
    description: "Split-flap board that re-shuffles character-by-character on a loop.", slot: "navbar-pets", stageClass: "p-6",
    render: () => <FlightBoard className="mx-auto w-full max-w-md" />,
    renderNavbar: () => <FlightBoard className="w-64 scale-[0.6]" />,
  },
];

export function getHubEntry(id: string): HubLibraryEntry | undefined {
  return HUB_LIBRARY.find((entry) => entry.id === id);
}
