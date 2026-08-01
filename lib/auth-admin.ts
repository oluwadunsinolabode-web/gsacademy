import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false, admin: false };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("auth_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return {
    authenticated: true,
    admin: !!admin,
  };
}