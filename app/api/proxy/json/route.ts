import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate URL to prevent SSRF
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
    // Only allow http and https
    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: { 
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; DevStatus/1.0)"
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "application/json";
    
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: "Target URL did not return JSON data", status: response.status },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error fetching from proxy:", error);
    return NextResponse.json(
      { error: "Failed to fetch from target URL" },
      { status: 500 }
    );
  }
}
