import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("public_accepted_submissions")
    .select("company_name", { count: "exact", head: true });

  if (error) throw error;

  return NextResponse.json({ count: count || 0 });
}
