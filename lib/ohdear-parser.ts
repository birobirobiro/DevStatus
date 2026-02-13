import type { WebsiteData } from "@/types";

interface OhDearMonitor {
  label: string;
  url: string;
  status: string;
}

interface OhDearResponse {
  title: string;
  timezone: string;
  pinnedUpdate: unknown | null;
  monitors: Record<string, OhDearMonitor[]>;
  updatesPerDay: Record<string, unknown[]>;
  summarizedStatus: string;
}

export async function parseOhDear(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const jsonUrl = `${baseUrl}/json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(jsonUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OhDearResponse = await response.json();

    const statusIndicator = data.summarizedStatus === "up" 
      ? "operational" 
      : data.summarizedStatus === "degraded"
      ? "degraded"
      : "major_outage";

    const components = data.monitors
      ? Object.entries(data.monitors).flatMap(([group, monitors]) =>
          monitors.map((monitor) => ({
            id: monitor.label.toLowerCase().replace(/\s+/g, "-"),
            name: monitor.label,
            description: monitor.url,
            status: monitor.status === "up" ? "operational" : "major_outage",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            position: 0,
            group_id: group,
            showcase: false,
          }))
        )
      : [];

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components,
      status: {
        description: data.summarizedStatus === "up" 
          ? "All systems operational" 
          : `${serviceName} is experiencing issues`,
        indicator: statusIndicator,
      },
      name: serviceName,
      category,
      statusPageType: "ohdear",
      url: statusPageUrl,
    };
  } catch (error) {
    console.error(`[OhDear] Error fetching ${serviceName}:`, error);
    throw error;
  }
}
