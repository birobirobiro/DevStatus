import type { WebsiteData } from "@/types";

/**
 * Parse UptimeRobot status page API
 * Endpoint: https://stats.uptimerobot.com/api/getMonitorList/{psp_id}?page=1
 */
export async function parseUptimeRobot(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Extract PSP ID from URL
    // URL format: https://stats.uptimerobot.com/{psp_id}/
    const urlMatch = statusPageUrl.match(/stats\.uptimerobot\.com\/([^\/]+)/);
    const pspId = urlMatch ? urlMatch[1] : null;

    if (!pspId) {
      throw new Error("Could not extract PSP ID from URL");
    }

    const apiUrl = `https://stats.uptimerobot.com/api/getMonitorList/${pspId}?page=1`;
    
    // Use proxy to avoid CORS
    const proxyUrl = `/api/proxy/json?url=${encodeURIComponent(apiUrl)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // UptimeRobot API format
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
      statusPageType: "uptimerobot",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing UptimeRobot for ${serviceName}:`, error);
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
      statusPageType: "uptimerobot",
      url: statusPageUrl,
    };
  }
}
