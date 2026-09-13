"use client";

import { createBrowserClient } from "@supabase/ssr";

export const getSupabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "placeholder-publishable-key",
  );
