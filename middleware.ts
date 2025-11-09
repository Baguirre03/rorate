import { createServerClient } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const submissionsRateLimit = new Ratelimit({
  // Cast: Vercel KV implements the commands used by Ratelimit.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redis: kv as any,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  prefix: "rl:submissions",
});

function getClientIp(req: NextRequest): string {
  const ip = (req as NextRequest & { ip?: string }).ip;
  if (ip) {
    return ip;
  }
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api/submissions")) {
    if (req.method === "POST") {
      const identifier = `submissions:${getClientIp(req)}`;
      const { success, limit, remaining, reset } =
        await submissionsRateLimit.limit(identifier);

      if (!success) {
        const retryAfter = Math.max(
          0,
          Math.ceil(reset - Date.now() / 1000)
        ).toString();
        const response = NextResponse.json(
          {
            error: "Too many submissions",
            message: "Please wait a moment before trying again.",
          },
          { status: 429 }
        );
        response.headers.set("Retry-After", retryAfter);
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", "0");
        response.headers.set(
          "X-RateLimit-Reset",
          new Date(reset * 1000).toISOString()
        );
        return response;
      }

      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(reset * 1000).toISOString()
      );
      return response;
    }

    return NextResponse.next();
  }

  if (!pathname.startsWith("/submissions")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.email !== process.env.ADMIN_EMAIL!) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/submissions/:path*", "/api/submissions/:path*"],
};
