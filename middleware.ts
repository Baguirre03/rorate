import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Skip authentication/admin check for public endpoints
  // - GET /api/submissions/count (public counter)
  // - POST /api/submissions (public submission endpoint)
  // - GET /api/submissions/check (user can check their own submissions)
  if (
    pathname === "/api/submissions/count" ||
    pathname === "/api/submissions/check" ||
    (pathname === "/api/submissions" && method === "POST")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const adminEmails = [process.env.ADMIN_EMAIL!, process.env.ADMIN_EMAIL2!];

  if (!user?.email) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (!adminEmails.includes(user?.email)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/submissions/:path*", "/api/submissions/:path*"],
};
