import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { count, error } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted");

    if (error) {
      console.error("Supabase error fetching submission count:", error);
      throw error;
    }

    // Return with cache headers - allow short cache for performance
    // but ensure it's fresh enough for the counter
    return NextResponse.json(
      { count: count ?? 0 },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching submission count:", error);
    // Return error with no-cache headers so client can retry
    return NextResponse.json(
      { 
        error: "Failed to fetch submission count",
        count: 0, // Provide fallback count
      },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
