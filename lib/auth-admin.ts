import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("NO_USER");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("auth_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!admin) {
    throw new Error("NOT_ADMIN");
  }

  return {
    authenticated: true,
    admin: true,
  };
}