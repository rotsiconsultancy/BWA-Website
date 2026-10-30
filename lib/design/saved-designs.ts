"use client";

import { useEffect, useState } from "react";

// Designs a customer sent from /design-your-own, kept only in this browser so
// they can reopen them from the account panel. Like saved-customer.ts: no
// account, and "Forget" clears it from the phone.
export type SavedDesign = {
  /** The id in the WhatsApp message, e.g. D-4K7QM. */
  id: string;
  name: string;
  /** The design link's query, e.g. "v=1&stone=simba-gold&design=one&size=medium". */
  query: string;
  /** A bead photo or colour for the list. */
  bead: string | null;
  savedAt: string;
};

const STORAGE_KEY = "bwa_saved_designs";
const CHANGE_EVENT = "bwa-saved-designs";
const MAX_DESIGNS = 10;

export function readSavedDesigns(): SavedDesign[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((d) => d?.id && d?.query) : [];
  } catch {
    return [];
  }
}

function write(value: SavedDesign[]) {
  try {
    if (value.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the site still works, it just forgets.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveDesign(design: SavedDesign) {
  // The same design sent twice keeps only its latest id.
  write([design, ...readSavedDesigns().filter((d) => d.query !== design.query)].slice(0, MAX_DESIGNS));
}

export function forgetSavedDesigns() {
  write([]);
}

export function useSavedDesigns() {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  useEffect(() => {
    const sync = () => setDesigns(readSavedDesigns());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return designs;
}
