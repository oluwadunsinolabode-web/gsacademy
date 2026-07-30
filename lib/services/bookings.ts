import { supabase } from "@/lib/supabase";

export async function getBookings() {
  return await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function approveBooking(id: string) {
  return await supabase
    .from("bookings")
    .update({
      status: "Approved",
    })
    .eq("id", id)
    .select()
    .single();
}

export async function rejectBooking(id: string) {
  return await supabase
    .from("bookings")
    .update({
      status: "Rejected",
    })
    .eq("id", id)
    .select()
    .single();
}