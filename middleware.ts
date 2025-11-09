import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(_req: NextRequest) {
  // TEMPORARILY HIDE SUBMISSIONS ROUTE
  // Return 404 for all submissions routes
  // To re-enable, uncomment the code below and remove this return statement

  void _req; // Parameter required for middleware signature

  return new NextResponse(null, { status: 404 });

  // Original auth middleware (commented out while submissions route is hidden)
  // Uncomment the import above and the code below to re-enable:
  /*
  import { createServerClient } from "@supabase/ssr";
  
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return _req.cookies.getAll();
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
    const redirectUrl = _req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL!) {
    const redirectUrl = _req.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
  */
}

export const config = {
  matcher: ["/submissions/:path*"],
};
