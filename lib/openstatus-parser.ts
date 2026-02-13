import type { WebsiteData } from "@/types";

/**
 * Parse OpenStatus.dev JSON feed
 * Docs: https://docs.openstatus.dev/reference/status-page/
 * Endpoint: /feed/json
 */
export async function parseOpenStatus(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/feed/json`;

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

    // OpenStatus JSON feed format:
    // https://docs.openstatus.dev/reference/status-page/#json-feed
    // {
    //   "page": { "name", "url", "slug", "status" },
    //   "incidents": [],
    //   "components": [{ "name", "status", ... }]
    // }

    const page = data.page || {};
    const incidents = data.incidents || [];
    const components = data.components || [];

    const status = page.status?.toLowerCase?.() || "operational";

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = "All systems operational";

    switch (status) {
      case "operational":
        indicator = "none";
        description = "All systems operational";
        break;
      case "degraded":
        indicator = "minor";
        description = "Some systems degraded";
        break;
      case "outage":
      case "down":
        indicator = "major";
        description = "Some systems experiencing outages";
        break;
      case "maintenance":
        indicator = "maintenance";
        description = "Scheduled maintenance in progress";
        break;
      default:
        indicator = "none";
    }

    // Check for active incidents
    const activeIncidents = incidents.filter(
      (inc: any) => !inc.resolved && !inc.status?.toLowerCase()?.includes("resolved")
    );

    if (activeIncidents.length > 0) {
      const incident = activeIncidents[0];
      description = incident.name || incident.title || "Active incident";

      const severity = incident.severity?.toLowerCase() || "";
      if (severity.includes("critical")) {
        indicator = "critical";
      } else if (severity.includes("major")) {
        indicator = "major";
      } else if (severity.includes("minor")) {
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
        updated_at: new Date().toISOString(),
      },
      components: mappedComponents,
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "openstatus",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing OpenStatus for ${serviceName}:`, error);
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
      statusPageType: "openstatus",
      url: statusPageUrl,
    };
  }
}
