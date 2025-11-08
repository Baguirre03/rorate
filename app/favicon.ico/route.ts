import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Read the icon.svg file
    const iconPath = path.join(process.cwd(), "app", "icon.svg");
    const svgContent = fs.readFileSync(iconPath, "utf-8");

    // Return as SVG with proper headers
    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    // Fallback to default favicon if there's an error
    return NextResponse.redirect("/favicon.ico");
  }
}
