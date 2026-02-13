import type { WebsiteData } from "@/types";

/**
 * Parse Status.io API response
 * Status.io uses a similar but different structure from Atlassian Statuspage
 * Docs: https://status.io/docs/api/
 */
export async function parseStatusIo(
  apiUrl: string,
  serviceName: string,
  serviceUrl: string,
  category: string
): Promise<WebsiteData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw new Error("Network error fetching Status.io API");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Status.io: ${response.statusText}`);
    }

    const data = await response.json();

    // Status.io structure varies, but commonly has:
    // - status: { description, indicator }
    // - components: array of components
    // - incidents: array of incidents

    const status = data.status || {};
    const components = data.components || data.result?.status || [];
    const incidents = data.incidents || [];

    // Determine indicator
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = status.description || "All systems operational";

    const statusCode = status.code || status.indicator || "operational";

    switch (statusCode.toLowerCase()) {
      case "operational":
      case "up":
      case "none":
        indicator = "none";
        break;
      case "degraded":
      case "degraded_performance":
      case "partial":
      case "minor":
        indicator = "minor";
        break;
      case "major":
      case "major_outage":
      case "down":
        indicator = "major";
        break;
      case "critical":
        indicator = "critical";
        break;
      case "maintenance":
      case "scheduled":
        indicator = "maintenance";
        break;
      default:
        indicator = "none";
    }

    // Check for active incidents
    const activeIncidents = incidents.filter(
      (inc: any) =>
        !inc.resolved &&
        !inc.status?.toLowerCase().includes("resolved") &&
        !inc.status?.toLowerCase().includes("completed")
    );

    if (activeIncidents.length > 0) {
      const incident = activeIncidents[0];
      description = incident.name || incident.title || "Active incident";
      if (incident.impact) {
        switch (incident.impact.toLowerCase()) {
          case "critical":
            indicator = "critical";
            break;
          case "major":
            indicator = "major";
            break;
          case "minor":
          case "degraded":
            indicator = "minor";
            break;
        }
      }
    }

    // Map components
    const mappedComponents = Array.isArray(components)
      ? components.map((comp: any) => ({
          id: comp.id || comp._id || String(Math.random()),
          name: comp.name || comp.component || "Unknown",
          status: comp.status || comp.state || "operational",
        }))
      : [];

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: new Date().toISOString(),
      },
      components: mappedComponents,
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "statusio",
      url: serviceUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Status.io for ${serviceName}:`, error);
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: "Error fetching status",
        indicator: "error",
      },
      name: serviceName,
      category,
      statusPageType: "statusio",
      url: serviceUrl,
    };
  }
}
