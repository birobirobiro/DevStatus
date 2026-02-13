import type { WebsiteData } from "@/types";

interface UptimeKumaMonitor {
  id: number;
  name: string;
  active: boolean;
  status: number; // 0 = down, 1 = up, 2 = pending, 3 = maintenance
  uptime: number;
  heartbeatList?: Array<{
    status: number;
    time: string;
    msg: string;
  }>;
}

interface UptimeKumaResponse {
  config?: {
    slug: string;
    title: string;
    description?: string;
    icon?: string;
    theme?: string;
    published?: boolean;
    showTags?: boolean;
    customCSS?: string;
    footerText?: string;
    showPoweredBy?: boolean;
  };
  publicGroupList?: Array<{
    id: number;
    name: string;
    weight: number;
    monitorList: UptimeKumaMonitor[];
  }>;
  incident?: any;
  maintenanceList?: any[];
}

/**
 * Parse Uptime Kuma status page API
 * Uptime Kuma is a self-hosted monitoring tool
 * Public status page API: /api/status-page/heartbeat/{slug}
 * Docs: https://github.com/louislam/uptime-kuma/wiki
 */
export async function parseUptimeKuma(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Extract slug from URL (e.g., https://status.blender.org/status/public -> public)
    const urlParts = statusPageUrl.split('/');
    const slug = urlParts[urlParts.length - 1] || 'default';
    const baseUrl = statusPageUrl.replace(/\/status\/[^/]+$/, '');
    
    // Fetch status from Uptime Kuma API
    const apiUrl = `${baseUrl}/api/status-page/heartbeat/${slug}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let response: Response;
    try {
      response = await fetch(`/api/proxy/json?url=${encodeURIComponent(apiUrl)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw new Error("Network error fetching Uptime Kuma status");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Uptime Kuma status: ${response.statusText}`);
    }

    const data: UptimeKumaResponse = await response.json();

    // Determine overall status
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    // Check all monitors
    const allMonitors: UptimeKumaMonitor[] = [];
    data.publicGroupList?.forEach((group) => {
      group.monitorList?.forEach((monitor) => {
        allMonitors.push(monitor);
      });
    });

    const downMonitors = allMonitors.filter((m) => m.status === 0);
    const maintenanceMonitors = allMonitors.filter((m) => m.status === 3);

    if (downMonitors.length > 0) {
      if (downMonitors.length === allMonitors.length) {
        indicator = "critical";
        description = "All systems down";
      } else if (downMonitors.length > allMonitors.length / 2) {
        indicator = "major";
        description = `${downMonitors.length} services experiencing outages`;
      } else {
        indicator = "minor";
        description = `${downMonitors.length} service(s) down`;
      }
    } else if (maintenanceMonitors.length > 0) {
      indicator = "maintenance";
      description = "Scheduled maintenance in progress";
    }

    // Map monitors as components
    const mappedComponents = allMonitors.map((monitor) => {
      let status = "operational";
      if (monitor.status === 0) {
        status = "down";
      } else if (monitor.status === 2) {
        status = "pending";
      } else if (monitor.status === 3) {
        status = "maintenance";
      }

      return {
        id: String(monitor.id),
        name: monitor.name,
        status,
      };
    });

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components: mappedComponents,
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "uptimekuma",
      url: statusPageUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Uptime Kuma status for ${serviceName}:`, error);
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: "Error fetching status",
        indicator: "error",
      },
      name: serviceName,
      category,
      statusPageType: "uptimekuma",
      url: statusPageUrl,
    };
  }
}
