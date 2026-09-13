"use client";

import { createBrowserClient } from "@supabase/ssr";

export const getSupabaseBrowser = () =>
  createBrowserClient(
    process.env.SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.SUPABASE_PUBLISHABLE_KEY || "placeholder-publishable-key",
  );
