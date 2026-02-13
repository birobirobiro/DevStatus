import type { WebsiteData } from "@/types";

/**
 * Parse Better Stack (Better Uptime) status API
 * Format: https://status.example.com/index.json
 * Docs: https://betterstack.com/docs/uptime/api/
 */
export async function parseBetterStack(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/index.json`;

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

    // Better Stack JSON API format (from index.json)
    // data.data = status page info
    // data.included = array of resources, sections, reports, updates
    
    const pageData = data.data || {};
    const attributes = pageData.attributes || {};
    const included = data.included || [];

    // Get aggregate state from status page
    const aggregateState = attributes.aggregate_state?.toLowerCase() || "operational";

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" =
      "none";
    let description = "All systems operational";

    // Map aggregate state to indicator
    switch (aggregateState) {
      case "operational":
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

    // Extract resources (monitors) from included
    const resources = included.filter((item: any) => item.type === "status_page_resource");
    
    // Extract active reports/incidents
    const reports = included.filter((item: any) => 
      item.type === "status_report" && 
      item.attributes?.aggregate_state !== "resolved"
    );

    // Check for active incidents
    if (reports.length > 0) {
      const activeReport = reports[0];
      description = activeReport.attributes?.title || "Active incident";
      
      // Determine severity from report state
      const reportState = activeReport.attributes?.aggregate_state?.toLowerCase();
      if (reportState === "down" || reportState === "outage") {
        indicator = "major";
      } else if (reportState === "degraded") {
        indicator = "minor";
      }
    }

    // Map resources to components
    const components = resources.map((resource: any) => {
      const attrs = resource.attributes || {};
      return {
        id: resource.id || String(Math.random()),
        name: attrs.public_name || attrs.name || "Unknown",
        status: attrs.status || "operational",
      };
    });

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: attributes.updated_at || new Date().toISOString(),
      },
      components,
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "betterstack",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Better Stack for ${serviceName}:`, error);
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
      statusPageType: "betterstack",
      url: statusPageUrl,
    };
  }
}
