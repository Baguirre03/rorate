import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let redirectTo = requestUrl.searchParams.get("redirectTo") || "/me";

  console.log("redirectTo", redirectTo);
  // Decode the redirectTo in case it was double-encoded
  try {
    redirectTo = decodeURIComponent(redirectTo);
  } catch {
    // If decoding fails, use as-is
  }

  if (code) {
    const response = NextResponse.next();

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Construct the redirect URL using request.url as base
      const redirectUrl = new URL(redirectTo, request.url);
      redirectUrl.searchParams.set("signedIn", "true");

      console.log("Redirecting to:", redirectUrl.toString());
      console.log("redirectTo param was:", redirectTo);
      console.log("Full callback URL:", requestUrl.toString());

      const redirectResponse = NextResponse.redirect(redirectUrl);

      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });

      return redirectResponse;
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
