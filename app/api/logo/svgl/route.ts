import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");

  if (!term) {
    return NextResponse.json({ error: "Missing term parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.svgl.app/?search=${encodeURIComponent(term)}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `SVGL API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from SVGL:", error);
    return NextResponse.json(
      { error: "Failed to fetch from SVGL" },
      { status: 500 }
    );
  }
}
