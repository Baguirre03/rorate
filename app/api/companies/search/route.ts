import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CompanySearch/1.0)",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch company suggestions" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching company suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch company suggestions" },
      { status: 500 }
    );
  }
}
