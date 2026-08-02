import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    authenticated: !!user,
    admin: !!user,
  };
}