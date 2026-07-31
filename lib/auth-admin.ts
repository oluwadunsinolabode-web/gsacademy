import { createServerSupabase } from "@/lib/supabase-server";

export async function isAdmin() {
  const supabase = await createServerSupabase();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      admin: false,
      user: null,
    };
  }

  // Check if user exists in admins table
 const { data: admin } = await supabase
  .from("admins")
  .select("*")
  .eq("email", user.email)
  .eq("active", true)
  .single();

  return {
    authenticated: true,
    admin: !!admin,
    user,
  };
}