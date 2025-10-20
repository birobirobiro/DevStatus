import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "birobirobiro/DevStatus";

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    const { commentId, reaction } = await request.json();

    if (!commentId || !reaction) {
      return NextResponse.json(
        { error: "Comment ID and reaction are required" },
        { status: 400 }
      );
    }

    // Valid reactions: +1, -1, laugh, confused, heart, hooray, rocket, eyes
    const validReactions = ["+1", "-1", "heart"];
    if (!validReactions.includes(reaction)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    // Add reaction to comment
    const reactionResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/issues/comments/${commentId}/reactions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: reaction,
        }),
      }
    );

    if (!reactionResponse.ok) {
      const error = await reactionResponse.text();
      console.error("GitHub API error:", error);
      return NextResponse.json(
        { error: "Failed to add reaction" },
        { status: reactionResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reaction API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

