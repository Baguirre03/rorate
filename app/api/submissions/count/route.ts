import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  try {
    const { count, error } = await supabase
      .from("public_accepted_submissions")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching submission count:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission count" },
      { status: 500 }
    );
  }
}
