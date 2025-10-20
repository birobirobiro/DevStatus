import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || "birobirobiro/DevStatus";
const [OWNER, REPO_NAME] = REPO.split("/");

interface ServiceSuggestion {
  name: string;
  url: string;
  category: string;
  statusPageType?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    const suggestion: ServiceSuggestion = await request.json();

    if (!suggestion.name || !suggestion.url || !suggestion.category) {
      return NextResponse.json(
        { error: "Name, URL and category are required" },
        { status: 400 }
      );
    }

    // 1. Get the current sites.ts file
    const fileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/contents/data/sites.ts`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch sites.ts file" },
        { status: 500 }
      );
    }

    const fileData = await fileResponse.json();
    const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");
    const currentSha = fileData.sha;

    // 2. Generate new service entry
    const newServiceEntry = generateServiceEntry(suggestion);

    // 3. Find insertion point (before the closing bracket)
    const insertionPoint = currentContent.lastIndexOf("];");
    const newContent =
      currentContent.substring(0, insertionPoint) +
      newServiceEntry +
      currentContent.substring(insertionPoint);

    // 4. Create a new branch
    const branchName = `add-service-${suggestion.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    
    const mainBranchResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/git/ref/heads/main`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const mainBranchData = await mainBranchResponse.json();
    const mainSha = mainBranchData.object.sha;

    // Create new branch
    const createBranchResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: mainSha,
        }),
      }
    );

    if (!createBranchResponse.ok) {
      const error = await createBranchResponse.text();
      console.error("Failed to create branch:", error);
      return NextResponse.json(
        { error: "Failed to create branch" },
        { status: 500 }
      );
    }

    // 5. Update the file in the new branch
    const updateFileResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/contents/data/sites.ts`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add ${suggestion.name} to services list`,
          content: Buffer.from(newContent).toString("base64"),
          sha: currentSha,
          branch: branchName,
        }),
      }
    );

    if (!updateFileResponse.ok) {
      const error = await updateFileResponse.text();
      console.error("Failed to update file:", error);
      return NextResponse.json(
        { error: "Failed to update file" },
        { status: 500 }
      );
    }

    // 6. Create pull request
    const prTitle = `Add ${suggestion.name} to services list`;
    const prBody = generatePRDescription(suggestion);

    const createPRResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: prTitle,
          body: prBody,
          head: branchName,
          base: "main",
        }),
      }
    );

    if (!createPRResponse.ok) {
      const error = await createPRResponse.text();
      console.error("Failed to create PR:", error);
      return NextResponse.json(
        { error: "Failed to create pull request" },
        { status: 500 }
      );
    }

    const prData = await createPRResponse.json();

    return NextResponse.json({
      success: true,
      prNumber: prData.number,
      prUrl: prData.html_url,
      message: "Pull request created successfully!",
    });
  } catch (error) {
    console.error("Error in create-pr API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateServiceEntry(suggestion: ServiceSuggestion): string {
  const hasStatusPageType = suggestion.statusPageType && suggestion.statusPageType !== "default";
  
  return `
  // Suggested by community
  {
    name: "${suggestion.name}",
    url: "${suggestion.url}",
    category: "${suggestion.category}",${hasStatusPageType ? `\n    statusPageType: "${suggestion.statusPageType}",` : ""}
  },
`;
}

function generatePRDescription(suggestion: ServiceSuggestion): string {
  return `## Service Suggestion

This PR adds **${suggestion.name}** to the services list.

### Service Details

- **Name**: ${suggestion.name}
- **Category**: ${suggestion.category}
- **Status Page URL**: ${suggestion.url}
- **Type**: ${suggestion.statusPageType || "Atlassian API (default)"}

${suggestion.notes ? `### Additional Notes\n\n${suggestion.notes}` : ""}

### Checklist

- [x] Service name is descriptive and clear
- [x] URL points to a valid status page
- [x] Category matches existing categories
- [x] Status page type is correctly identified

---

**Submitted via DevStatus automatic PR system**

Thank you for contributing to DevStatus! 🎉
`;
}

