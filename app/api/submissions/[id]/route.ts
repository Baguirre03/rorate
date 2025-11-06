import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const response = NextResponse.next();

    // Handle both sync and async params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const submissionId = parseInt(resolvedParams.id);

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL!) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["accepted", "declined", "waiting"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be 'accepted', 'declined', or 'waiting'",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", submissionId)
      .select(
        `
        *,
        companies (
          id,
          name
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message || "Database error");
    }

    // Return JSON response with updated cookies from Supabase
    const jsonResponse = NextResponse.json({ success: true, data });

    // Copy any cookies that Supabase set during the request
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value);
    });

    return jsonResponse;
  } catch (error) {
    console.error("Error updating submission:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update submission";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
