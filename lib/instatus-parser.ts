import type { WebsiteData } from "@/types";

/**
 * Parse Instatus status API
 * Docs: https://instatus.com/help/api/
 */
export async function parseInstatus(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrls = [
      `${baseUrl}/api/v1/status`,
      `${baseUrl}/api/v1/incidents`,
      `${baseUrl}/api/v1/maintenances`,
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
      throw lastError || new Error("Failed to fetch Instatus API");
    }

    const data = await response.json();

    // Instatus response format: https://instatus.com/help/api/status-pages
    // {
    //   "page": { "id", "name", "url", "state" },
    //   "components": [{ "id", "name", "status", "description" }],
    //   "incident": null | { ... }
    // }

    const page = data.page || {};
    const components = data.components || [];
    const incident = data.incident || null;

    // Status mapping: https://instatus.com/help/api/status-pages
    const statusMap: Record<string, "operational" | "degraded" | "outage" | "maintenance"> = {
      operational: "operational",
      DEGRADED_PERFORMANCE: "degraded",
      PARTIAL_OUTAGE: "outage",
      MAJOR_OUTAGE: "outage",
      UNDER_MAINTENANCE: "maintenance",
    };

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = "All systems operational";

    // Page state: https://instatus.com/help/api/status-pages
    const pageState = page.state?.toLowerCase?.() || "";
    if (pageState.includes("operational") || pageState.includes("up")) {
      indicator = "none";
      description = "All systems operational";
    } else if (pageState.includes("degraded")) {
      indicator = "minor";
      description = "Some systems degraded";
    } else if (pageState.includes("outage") || pageState.includes("down")) {
      indicator = "major";
      description = "Some systems experiencing outages";
    } else if (pageState.includes("maintenance")) {
      indicator = "maintenance";
      description = "Scheduled maintenance in progress";
    }

    // Check for active incidents: https://instatus.com/help/api/incidents
    if (incident && !incident.resolved && !incident.ended) {
      description = incident.name || "Active incident";

      const impact = incident.impact?.toLowerCase() || "";
      if (impact.includes("critical")) {
        indicator = "critical";
      } else if (impact.includes("major")) {
        indicator = "major";
      } else if (impact.includes("minor")) {
        indicator = "minor";
      } else if (impact.includes("maintenance")) {
        indicator = "maintenance";
      }
    }

    // Map components
    const mappedComponents = components.map((comp: any) => ({
      id: comp.id || String(Math.random()),
      name: comp.name || comp.title || "Unknown",
      status: statusMap[comp.status] || comp.status || "operational",
    }));

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components: mappedComponents,
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "instatus",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Instatus for ${serviceName}:`, error);
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
      statusPageType: "instatus",
      url: statusPageUrl,
    };
  }
}
