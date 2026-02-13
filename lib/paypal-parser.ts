import type { WebsiteData } from "@/types";

interface PayPalComponent {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  category: {
    name: string;
    description: string | null;
  };
  status: {
    production: string | null;
    sandbox: string | null;
  };
}

interface PayPalEvent {
  id: number;
  referenceId: string;
  summary: string;
  body: string;
  environment: string;
  type: string;
  pubDate: string;
  startDate: string;
  endDate: string | null;
  state: string;
  severity: string;
  impactedComponents: Array<{
    id: number;
    name: string;
  }>;
  components: Array<{
    id: number;
    name: string;
  }>;
}

interface PayPalComponentsResponse {
  result: PayPalComponent[];
  lang: string;
}

interface PayPalEventsResponse {
  result: PayPalEvent[];
}

/**
 * Parse PayPal status API
 * Uses custom API endpoints:
 * - /api/v1/components - List of all components and their status
 * - /api/v1/events?s=true - List of events/incidents
 */
export async function parsePayPalStatus(
  baseUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Fetch components
    const componentsController = new AbortController();
    const componentsTimeout = setTimeout(() => componentsController.abort(), 10000);
    
    let componentsResponse: Response;
    try {
      const componentsUrl = `${baseUrl}/api/v1/components`;
      componentsResponse = await fetch(`/api/proxy/json?url=${encodeURIComponent(componentsUrl)}`, {
        signal: componentsController.signal,
      });
      clearTimeout(componentsTimeout);
    } catch (fetchError) {
      clearTimeout(componentsTimeout);
      throw new Error("Network error fetching PayPal components");
    }

    if (!componentsResponse.ok) {
      throw new Error(`Failed to fetch PayPal components: ${componentsResponse.statusText}`);
    }

    const componentsData: PayPalComponentsResponse = await componentsResponse.json();

    // Fetch events (incidents)
    const eventsController = new AbortController();
    const eventsTimeout = setTimeout(() => eventsController.abort(), 10000);
    
    let eventsResponse: Response;
    try {
      const eventsUrl = `${baseUrl}/api/v1/events?s=true`;
      eventsResponse = await fetch(`/api/proxy/json?url=${encodeURIComponent(eventsUrl)}`, {
        signal: eventsController.signal,
      });
      clearTimeout(eventsTimeout);
    } catch (fetchError) {
      clearTimeout(eventsTimeout);
      throw new Error("Network error fetching PayPal events");
    }

    let eventsData: PayPalEventsResponse | null = null;
    if (eventsResponse.ok) {
      eventsData = await eventsResponse.json();
    }

    // Filter active incidents (no endDate or state !== "closed")
    const activeIncidents = eventsData?.result?.filter(
      (event) => !event.endDate && event.state !== "closed"
    ) || [];

    // Determine overall status
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (activeIncidents.length > 0) {
      // Sort by start date (most recent first)
      const sortedIncidents = activeIncidents.sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      const mostRecent = sortedIncidents[0];

      description = mostRecent.summary;

      // Map severity to indicator
      const severity = mostRecent.severity?.toLowerCase() || "";
      if (severity.includes("critical")) {
        indicator = "critical";
      } else if (severity.includes("major")) {
        indicator = "major";
      } else if (severity.includes("minor") || severity.includes("degraded")) {
        indicator = "minor";
      } else if (mostRecent.type?.toLowerCase().includes("maintenance")) {
        indicator = "maintenance";
      } else {
        // Default based on impacted components
        indicator = mostRecent.impactedComponents?.length > 5 ? "major" : "minor";
      }
    } else {
      // Check if any component is not operational
      const nonOperationalComponents = componentsData.result?.filter(
        (comp) => comp.status?.production && comp.status.production !== "Operational"
      ) || [];

      if (nonOperationalComponents.length > 0) {
        const criticalCount = nonOperationalComponents.filter((comp) => {
          const status = comp.status?.production?.toLowerCase() || "";
          return status.includes("outage") || status.includes("down") || status.includes("critical");
        }).length;

        if (criticalCount > 0) {
          indicator = "major";
        } else {
          indicator = "minor";
        }
        description = `${nonOperationalComponents.length} component(s) experiencing issues`;
      }
    }

    // Map components - only include top-level components (no parentId) for cleaner view
    const mappedComponents = componentsData.result
      ?.filter((comp) => comp.parentId === null)
      .map((comp) => ({
        id: String(comp.id),
        name: comp.name,
        status: comp.status?.production?.toLowerCase() || "unknown",
      })) || [];

    // Get last update time from most recent event or current time
    const lastUpdate = eventsData?.result?.[0]?.pubDate || new Date().toISOString();

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: baseUrl,
        updated_at: lastUpdate,
      },
      components: mappedComponents,
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "paypal",
      url: baseUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing PayPal status for ${serviceName}:`, error);
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: baseUrl,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: "Error fetching status",
        indicator: "error",
      },
      name: serviceName,
      category,
      statusPageType: "paypal",
      url: baseUrl,
    };
  }
}
