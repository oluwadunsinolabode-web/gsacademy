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
    .select("id")
    .eq("email", user.email!)
    .eq("active", true)
    .maybeSingle();

  return {
    authenticated: true,
    admin: !!admin,
  };
}