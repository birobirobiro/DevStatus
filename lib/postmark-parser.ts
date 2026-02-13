import type { WebsiteData } from "@/types";

/**
 * Parse Postmark Status API
 * Docs: https://status.postmarkapp.com/api
 */
export async function parsePostmarkStatus(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/api\/v1\/status.*$/, "");
    const apiUrl = `${baseUrl}/api/v1/status`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Postmark API response format:
    // https://status.postmarkapp.com/api/v1/status
    // {
    //   "page": { "name", "state", "state_text", "url", ... },
    //   ...
    // }

    const page = data.page || {};
    const state = page.state?.toLowerCase?.() || "operational";

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = page.state_text || "All systems operational";

    switch (state) {
      case "operational":
        indicator = "none";
        description = page.state_text || "All systems operational";
        break;
      case "degraded":
        indicator = "minor";
        description = page.state_text || "Some systems degraded";
        break;
      case "under_maintenance":
        indicator = "maintenance";
        description = "Scheduled maintenance in progress";
        break;
      default:
        indicator = "none";
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: baseUrl,
        updated_at: page.updated_at || new Date().toISOString(),
      },
      components: [],
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "postmark",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Postmark for ${serviceName}:`, error);
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: { description: "Error fetching status", indicator: "error" },
      name: serviceName,
      category,
      statusPageType: "postmark",
      url: statusPageUrl,
    };
  }
}
