import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      admin: false,
    };
  }

  return {
    authenticated: true,
    admin: true,
  };
}