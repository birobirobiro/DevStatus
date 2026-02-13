import type { WebsiteData } from "@/types";

/**
 * Parse n8n status API
 * Format: https://status.n8n.cloud/ (custom API)
 */
export async function parseN8nStatus(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(statusPageUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // n8n API format
    const monitors = data.data || [];
    const statistics = data.statistics || {};
    const counts = statistics.counts || { up: 0, down: 0, total: 0 };

    // Determine overall status
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (counts.down > 0) {
      indicator = "major";
      description = `${counts.down} service(s) experiencing issues`;
    } else if (counts.up < counts.total) {
      indicator = "minor";
      description = "Some services may be experiencing issues";
    }

    // Map monitors to components
    const components = monitors.map((monitor: any) => {
      const statusClass = monitor.statusClass?.toLowerCase() || "success";
      let status = "operational";
      
      if (statusClass === "danger" || statusClass === "down") {
        status = "major_outage";
      } else if (statusClass === "warning") {
        status = "degraded_performance";
      } else if (statusClass === "success") {
        status = "operational";
      }

      return {
        id: String(monitor.monitorId || Math.random()),
        name: monitor.name || "Unknown",
        status: status,
      };
    });

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components,
      status: { description, indicator },
      name: serviceName,
      category,
      statusPageType: "n8n",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing n8n status for ${serviceName}:`, error);
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
      statusPageType: "n8n",
      url: statusPageUrl,
    };
  }
}
