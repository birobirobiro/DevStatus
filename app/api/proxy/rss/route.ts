import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { 
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "Mozilla/5.0 (compatible; DevStatus/1.0)"
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `RSS fetch error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    return new NextResponse(data, {
      headers: { "Content-Type": "application/rss+xml" },
    });
  } catch (error) {
    console.error("Error fetching RSS:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSS feed" },
      { status: 500 }
    );
  }
}
