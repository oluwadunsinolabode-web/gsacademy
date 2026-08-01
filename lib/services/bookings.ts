import { createServerSupabase } from "@/lib/supabase-server";

export async function getBookings() {
  const supabase = await createServerSupabase();

  return await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getBooking(id: string) {
  const supabase = await createServerSupabase();

  return await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
}