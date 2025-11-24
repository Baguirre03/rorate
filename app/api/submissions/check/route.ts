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
      return NextResponse.json(
        {
          error: "Failed to check submissions",
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasSubmitted: (data?.length ?? 0) > 0 && data?.[0]?.status != "declined",
      submissions: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check submissions" + error },
      { status: 500 }
    );
  }
}
