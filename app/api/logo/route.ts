import { NextRequest, NextResponse } from "next/server";

// Helper function to create a fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { error: "Domain parameter is required" },
      { status: 400 }
    );
  }

  try {
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    const response = await fetchWithTimeout(
      logoUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LogoProxy/1.0)",
        },
      },
      5000 // 5 second timeout
    );

    if (!response.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch (error) {
    // Handle network errors (DNS failures, timeouts, etc.) gracefully
    // Return 404 so the UI can show fallback icons instead of broken images
    const isNetworkError =
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch failed"));

    if (isNetworkError) {
      // Log for monitoring but return 404 for graceful degradation
      console.warn(`Logo fetch failed for domain ${domain}:`, error.message);
      return new NextResponse(null, { status: 404 });
    }

    // For other unexpected errors, still return 404 to prevent broken images
    console.error("Error fetching logo:", error);
    return new NextResponse(null, { status: 404 });
  }
}
