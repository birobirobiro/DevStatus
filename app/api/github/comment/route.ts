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

    const { serviceName, comment, type } = await request.json();

    if (!serviceName || !comment) {
      return NextResponse.json(
        { error: "Service name and comment are required" },
        { status: 400 }
      );
    }

    // Find or create issue for this service
    const issueNumber = await getOrCreateServiceIssue(serviceName);

    if (!issueNumber) {
      return NextResponse.json(
        { error: "Failed to create/find service issue" },
        { status: 500 }
      );
    }

    // Format comment with type emoji
    const typeEmoji = {
      problem: "🔴",
      resolved: "✅",
      info: "ℹ️",
    }[type] || "💬";

    const formattedComment = `${typeEmoji} **${type.toUpperCase()}**\n\n${comment}`;

    // Post comment to the issue
    const commentResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: formattedComment,
        }),
      }
    );

    if (!commentResponse.ok) {
      const error = await commentResponse.text();
      console.error("GitHub API error:", error);
      return NextResponse.json(
        { error: "Failed to post comment to GitHub" },
        { status: commentResponse.status }
      );
    }

    const commentData = await commentResponse.json();

    return NextResponse.json({
      success: true,
      issueNumber,
      commentId: commentData.id,
      url: commentData.html_url,
    });
  } catch (error) {
    console.error("Error in comment API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getOrCreateServiceIssue(serviceName: string): Promise<number | null> {
  try {
    const issueTitle = `Reports: ${serviceName}`;
    const searchQuery = `repo:${REPO} in:title "${issueTitle}" label:service-reports state:open`;

    // Search for existing issue
    const searchResponse = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.items && searchData.items.length > 0) {
        return searchData.items[0].number;
      }
    }

    // Create new issue
    const createResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: `# ${serviceName} - User Reports & Comments

This issue is used to collect user reports and comments about ${serviceName}.

## How to Report

You can report issues directly on [DevStatus](https://devstatus.vercel.app) or comment here.

### Report Types
- 🔴 **PROBLEM**: Service is experiencing issues
- ✅ **RESOLVED**: Issues have been resolved
- ℹ️ **INFO**: General information or updates

---

_This issue is automatically managed by DevStatus. Comments posted on the website will appear here._
`,
          labels: ["service-reports", serviceName.toLowerCase().replace(/\s+/g, "-")],
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("Failed to create issue:", error);
      return null;
    }

    const issueData = await createResponse.json();
    return issueData.number;
  } catch (error) {
    console.error("Error in getOrCreateServiceIssue:", error);
    return null;
  }
}

