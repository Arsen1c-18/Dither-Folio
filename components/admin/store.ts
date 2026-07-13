"use client";

import { create } from "zustand";
import { data } from "@/lib/data";
import type { PortfolioData } from "@/types";

/**
 * Dashboard state. Seeded from data/portfolio.json (the same source the public
 * site reads). Edits mutate a working copy; "Save" POSTs it back to the JSON.
 */
interface AdminStore {
  data: PortfolioData;
  dirty: boolean;
  saving: boolean;
  /** Apply an immutable update via a mutable draft (structuredClone under the hood). */
  update: (fn: (draft: PortfolioData) => void) => void;
  setSaving: (v: boolean) => void;
  markSaved: () => void;
}

export const useAdmin = create<AdminStore>((set) => ({
  data: structuredClone(data),
  dirty: false,
  saving: false,
  update: (fn) =>
    set((s) => {
      const next = structuredClone(s.data);
      fn(next);
      return { data: next, dirty: true };
    }),
  setSaving: (v) => set({ saving: v }),
  markSaved: () => set({ dirty: false }),
}));
