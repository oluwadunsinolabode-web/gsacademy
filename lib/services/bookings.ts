import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getBookings() {
  const result = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("================================");
  console.log("BOOKINGS RESULT");
  console.log(result);
  console.log("================================");

  return result;
}

export async function getBooking(id: string) {
  return await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
}