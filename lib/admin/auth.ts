import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function requireAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admin = getSupabaseAdmin();
  if (!url || !key || !admin) redirect("/admin/login?reason=config");
  const store = await cookies();
  const client = createServerClient(url, key, {
    cookies: { getAll: () => store.getAll(), setAll: () => undefined },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await admin
    .from("admin_profiles")
    .select("role,display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/admin/login?reason=role");
  return { user, profile, admin };
}
