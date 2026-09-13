import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || "placeholder-publishable-key";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
