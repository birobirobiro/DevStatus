/**
 * GitHub Comments System
 * Uses GitHub Issues API to store and retrieve comments for each service
 * Each service has a dedicated issue labeled with "service-reports"
 */

const GITHUB_API_BASE = "https://api.github.com";

// Helper to get repo safely
function getRepo() {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "birobirobiro/DevStatus";
  const parts = repo.split("/");
  if (parts.length !== 2) {
    console.error("Invalid GITHUB_REPO format. Expected: owner/repo");
    return null;
  }
  return { full: repo, owner: parts[0], name: parts[1] };
}

const REPO = getRepo()?.full || "birobirobiro/DevStatus";

export interface GitHubComment {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  html_url: string;
  reactions: {
    "+1": number;
    "-1": number;
    heart: number;
  };
}

export interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  state: string;
  comments: number;
  labels: Array<{ name: string }>;
}

export class GitHubCommentsAPI {
  /**
   * Find or create an issue for a specific service
   */
  static async getOrCreateServiceIssue(serviceName: string): Promise<number | null> {
    try {
      // Search for existing issue with service name
      const issueTitle = `Reports: ${serviceName}`;
      const searchQuery = `repo:${REPO} in:title "${issueTitle}" label:service-reports state:open`;
      
      const searchResponse = await fetch(
        `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
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

      // Issue doesn't exist, need to create it via backend
      return null;
    } catch (error) {
      console.error("Error finding issue:", error);
      return null;
    }
  }

  /**
   * Get comments for a specific issue
   */
  static async getIssueComments(issueNumber: number): Promise<GitHubComment[]> {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${REPO}/issues/${issueNumber}/comments?per_page=100&sort=created&direction=desc`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 60 }, // Cache for 60 seconds
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch comments:", response.status);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  /**
   * Post a comment to an issue (via backend API route)
   */
  static async postComment(
    serviceName: string,
    comment: string,
    type: "problem" | "resolved" | "info"
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/github/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceName,
          comment,
          type,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error posting comment:", error);
      return false;
    }
  }

  /**
   * Add reaction to a comment (via backend API route)
   */
  static async addReaction(commentId: number, reaction: "+1" | "-1" | "heart"): Promise<boolean> {
    try {
      const response = await fetch("/api/github/reaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          reaction,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error adding reaction:", error);
      return false;
    }
  }

  /**
   * Format GitHub comment for display
   */
  static formatComment(githubComment: GitHubComment) {
    return {
      id: githubComment.id.toString(),
      userName: githubComment.user.login,
      avatar: githubComment.user.avatar_url,
      comment: githubComment.body,
      timestamp: new Date(githubComment.created_at).getTime(),
      upvotes: githubComment.reactions["+1"] || 0,
      hearts: githubComment.reactions.heart || 0,
      url: githubComment.html_url,
    };
  }

  /**
   * Get service issue URL (for "View on GitHub" link)
   */
  static getServiceIssueUrl(issueNumber: number): string {
    return `https://github.com/${REPO}/issues/${issueNumber}`;
  }
}

