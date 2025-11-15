import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * Check if the current authenticated user has submitted a return offer
 * Returns { hasSubmitted: boolean }
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized - Authentication required",
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("submissions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (error) {
      console.error("Error checking user submissions:", error);
      return NextResponse.json(
        { error: "Failed to check submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasSubmitted: (data?.length ?? 0) > 0,
      submissions: data,
    });
  } catch (error) {
    console.error("Error in check submissions endpoint:", error);
    return NextResponse.json(
      { error: "Failed to check submissions" },
      { status: 500 }
    );
  }
}
