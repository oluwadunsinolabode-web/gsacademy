import { createServerSupabase } from "@/lib/supabase-server";

export async function isAdmin() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SERVER USER:", user);

  if (!user) {
    return {
      authenticated: false,
      admin: false,
      user: null,
    };
  }

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("auth_id", user.id)
.eq("active", true)
    .single();

  console.log("ADMIN RECORD:", admin);
  console.log("ADMIN ERROR:", error);

  return {
    authenticated: true,
    admin: !!admin,
    user,
  };
}