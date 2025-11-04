import { NextRequest, NextResponse } from "next/server";

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
    const response = await fetch(logoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LogoProxy/1.0)",
      },
    });

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
    console.error("Error fetching logo:", error);
    return new NextResponse(null, { status: 500 });
  }
}
