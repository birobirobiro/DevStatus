import type { WebsiteData } from "@/types";

interface AppMaxEvent {
  type: string;
  eventType: string;
  id: number;
  title: string;
  content: string;
  description: string;
  date: string;
  time: string;
  timeGMT: string;
  endDate: string | null;
  endDateGMT: string | null;
  timestamp: number;
  status: number; // 2 seems to be resolved, other values might be active
  icon: "alert-triangle" | "info" | string;
}

interface AppMaxResponse {
  status: boolean;
  results: AppMaxEvent[];
  meta: {
    count: number;
    date_range: {
      from: string;
      to: string;
    };
  };
}

/**
 * Parse AppMax status API and determine service status
 */
export async function parseAppMaxStatus(
  apiUrl: string,
  serviceName: string,
  serviceUrl: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Fetch events with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw new Error("Network error fetching AppMax status");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch AppMax status: ${response.statusText}`);
    }

    const data: AppMaxResponse = await response.json();

    if (!data.status || !data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid AppMax API response format");
    }

    // Filter active events
    // Status 2 seems to be resolved, and events with endDate are resolved
    // Active events are those without endDate and status !== 2
    const activeEvents = data.results.filter((event) => {
      // If it has an endDate, it's resolved
      if (event.endDate) {
        return false;
      }
      
      // If status is 2, it's likely resolved (based on "[Resolvido]" in titles)
      if (event.status === 2) {
        // Check if title contains "Resolvido" or "resolvido"
        const title = event.title.toLowerCase();
        if (title.includes("resolvido") || title.includes("resolved")) {
          return false;
        }
      }
      
      // Check if icon is "info" (usually informational, not active issue)
      if (event.icon === "info") {
        return false;
      }
      
      // If it has alert-triangle icon and no endDate, it's likely active
      return event.icon === "alert-triangle";
    });

    // Determine status indicator
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (activeEvents.length > 0) {
      // Sort by timestamp (most recent first)
      const sortedEvents = activeEvents.sort(
        (a, b) => b.timestamp - a.timestamp
      );
      const mostRecent = sortedEvents[0];

      // Determine severity based on content
      const content = mostRecent.content.toLowerCase();
      const title = mostRecent.title.toLowerCase();

      if (
        content.includes("indisponibilidade") ||
        content.includes("indisponível") ||
        content.includes("unavailable") ||
        title.includes("indisponibilidade")
      ) {
        indicator = "major";
      } else if (
        content.includes("intermitência") ||
        content.includes("intermitente") ||
        content.includes("instabilidade") ||
        content.includes("degradação") ||
        title.includes("intermitência") ||
        title.includes("instabilidade")
      ) {
        indicator = "minor";
      } else {
        indicator = "minor";
      }

      description = mostRecent.title;
    }

    // Get the most recent update time
    const allEvents = [...data.results];
    const sortedByDate = allEvents.sort(
      (a, b) => b.timestamp - a.timestamp
    );
    const lastUpdate = sortedByDate[0]
      ? new Date(sortedByDate[0].timestamp * 1000).toISOString()
      : new Date().toISOString();

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: lastUpdate,
      },
      components: [],
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "appmax",
      url: serviceUrl,
    };
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing AppMax status for ${serviceName}:`, error);
    }

    // Return error state
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
      statusPageType: "appmax",
      url: serviceUrl,
    };
  }
}

