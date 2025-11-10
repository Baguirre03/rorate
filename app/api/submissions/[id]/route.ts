import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1h"),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim() || null;
  const ipAddress = realIp || forwardedIp || "unknown";

  const { success } = await ratelimit.limit(ipAddress);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const resolvedParams = await Promise.resolve(params);
    const submissionId = parseInt(resolvedParams.id);

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user?.email !== process.env.ADMIN_EMAIL!) {
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

    const { error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", submissionId);

    if (error) {
      throw new Error(error.message || "Database error");
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating submission:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update submission";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
