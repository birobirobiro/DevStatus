import type { WebsiteData } from "@/types";

/**
 * Parse OnlineOrNot status API
 * Docs: https://developers.onlineornot.com/api/status-pages
 */
export async function parseOnlineOrNot(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    // OnlineOrNot API endpoints
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrls = [
      `${baseUrl}/api/v1/status`,
      `${baseUrl}/api/status`,
    ];

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const apiUrl of apiUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        clearTimeout(timeout);

        if (response.ok) {
          break;
        }
      } catch (err) {
        lastError = err as Error;
        continue;
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error("Failed to fetch OnlineOrNot API");
    }

    const data = await response.json();

    // OnlineOrNot API response format:
    // https://developers.onlineornot.com/api/status-pages
    // {
    //   "status_page": { "name", "url", "status" },
    //   "components": [{ "name", "status", ... }],
    //   "incidents": [...]
    // }

    const statusPage = data.status_page || {};
    const components = data.components || [];
    const incidents = data.incidents || [];

    const pageStatus = statusPage.status?.toLowerCase?.() || "operational";

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = "All systems operational";

    switch (pageStatus) {
      case "operational":
      case "up":
        indicator = "none";
        description = "All systems operational";
        break;
      case "degraded":
        indicator = "minor";
        description = "Some systems degraded";
        break;
      case "down":
      case "outage":
        indicator = "major";
        description = "Service experiencing outages";
        break;
      case "maintenance":
        indicator = "maintenance";
        description = "Scheduled maintenance in progress";
        break;
      default:
        indicator = "none";
    }

    // Check for active incidents
    // https://developers.onlineornot.com/api/status-page-incidents
    const activeIncidents = incidents.filter(
      (inc: any) => 
        !inc.resolved && 
        inc.status !== "resolved" &&
        inc.status !== "completed"
    );

    if (activeIncidents.length > 0) {
      const incident = activeIncidents[0];
      description = incident.name || incident.title || "Active incident";

      const impact = incident.impact?.toLowerCase() || "";
      if (impact.includes("critical")) {
        indicator = "critical";
      } else if (impact.includes("major")) {
        indicator = "major";
      } else if (impact.includes("minor")) {
        indicator = "minor";
      }
    }

    // Map components
    const mappedComponents = components.map((comp: any) => ({
      id: comp.id || comp.name?.toLowerCase()?.replace(/\s+/g, "-") || String(Math.random()),
      name: comp.name || "Unknown",
      status: comp.status || "operational",
    }));

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: baseUrl,
        updated_at: statusPage.updated_at || new Date().toISOString(),
      },
      components: mappedComponents,
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "onlineornot",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing OnlineOrNot for ${serviceName}:`, error);
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
      statusPageType: "onlineornot",
      url: statusPageUrl,
    };
  }
}
