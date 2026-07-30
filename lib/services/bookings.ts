import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getBookings() {
  return await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getBooking(id: string) {
  return await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
}