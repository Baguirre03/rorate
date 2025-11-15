import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * Check if the current authenticated user has submitted a return offer
 * Returns { hasSubmitted: boolean }
 */
export async function GET() {
  console.log("=== /api/submissions/check endpoint called ===");
  const supabase = await createServerSupabaseClient();

  try {
    console.log("Getting user from supabase...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("User:", user?.id, "Email:", user?.email);
    console.log("Auth error:", authError);

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
        },
        { status: 401 }
      );
    }

    // Let RLS handle the filtering based on auth.uid() = user_id
    // The explicit .eq() filter is redundant but harmless
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        *,
        companies (
          id,
          name
        )
      `
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error checking user submissions:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      return NextResponse.json(
        {
          error: "Failed to check submissions",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length ?? 0} submissions for user ${user.id}`);

    return NextResponse.json({
      hasSubmitted: (data?.length ?? 0) > 0,
      submissions: data || [],
    });
  } catch (error) {
    console.error("Error in check submissions endpoint:", error);
    return NextResponse.json(
      { error: "Failed to check submissions" },
      { status: 500 }
    );
  }
}
