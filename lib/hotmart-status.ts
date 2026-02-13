import type { WebsiteData } from "@/types";

interface HotmartIncident {
  id: string;
  description: string;
  created_at: string;
  resolved_at: string | null;
  incident_number: number | string;
  services: string[];
  type: "instability" | "unavailability";
  status: "Resolved" | "Active" | "Investigating";
}

interface HotmartService {
  id: string;
  name: string;
  description: string;
  children: string[];
}

/**
 * Parse Hotmart status API and determine service status
 */
export async function parseHotmartStatus(
  serviceName: string,
  serviceUrl: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Fetch incidents with timeout
    const incidentsController = new AbortController();
    const incidentsTimeout = setTimeout(() => incidentsController.abort(), 10000);
    
    let incidentsResponse: Response;
    try {
      incidentsResponse = await fetch("/api/proxy/json?url=https://status.hotmart.com/incidents", {
        signal: incidentsController.signal,
      });
      clearTimeout(incidentsTimeout);
    } catch (fetchError) {
      clearTimeout(incidentsTimeout);
      throw new Error("Network error fetching incidents");
    }

    if (!incidentsResponse.ok) {
      throw new Error(`Failed to fetch incidents: ${incidentsResponse.statusText}`);
    }

    const incidents: HotmartIncident[] = await incidentsResponse.json();

    // Fetch services with timeout
    const servicesController = new AbortController();
    const servicesTimeout = setTimeout(() => servicesController.abort(), 10000);
    
    let servicesResponse: Response;
    try {
      servicesResponse = await fetch("/api/proxy/json?url=https://status.hotmart.com/services", {
        signal: servicesController.signal,
      });
      clearTimeout(servicesTimeout);
    } catch (fetchError) {
      clearTimeout(servicesTimeout);
      throw new Error("Network error fetching services");
    }

    if (!servicesResponse.ok) {
      throw new Error(`Failed to fetch services: ${servicesResponse.statusText}`);
    }

    const servicesData: Record<string, HotmartService> = await servicesResponse.json();

    // Filter active incidents (not resolved)
    const activeIncidents = incidents.filter(
      (incident) => incident.status !== "Resolved" && !incident.resolved_at
    );

    // Determine status indicator
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (activeIncidents.length > 0) {
      // Sort by creation date (most recent first)
      const sortedIncidents = activeIncidents.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const mostRecent = sortedIncidents[0];

      // Determine severity based on type and description
      if (mostRecent.type === "unavailability") {
        indicator = "major";
        description = mostRecent.description;
      } else if (mostRecent.type === "instability") {
        // Check if it's a critical issue based on description
        const desc = mostRecent.description.toLowerCase();
        if (
          desc.includes("indisponibilidade") ||
          desc.includes("falha") ||
          desc.includes("interrupção")
        ) {
          indicator = "major";
        } else {
          indicator = "minor";
        }
        description = mostRecent.description;
      } else {
        indicator = "minor";
        description = mostRecent.description;
      }
    }

    // Extract components from active incidents
    const affectedServiceIds = new Set<string>();
    activeIncidents.forEach((incident) => {
      incident.services.forEach((serviceId) => {
        affectedServiceIds.add(serviceId);
      });
    });

    // Build components list
    const components: Array<{ id: string; name: string; status: string }> = [];
    
    // Get all services (excluding parent services)
    Object.values(servicesData).forEach((service) => {
      // Skip parent services (they have children)
      if (service.children && service.children.length > 0) {
        return;
      }

      const isAffected = affectedServiceIds.has(service.id);
      components.push({
        id: service.id,
        name: service.name,
        status: isAffected ? "degraded" : "operational",
      });
    });

    // Get the most recent update time
    const allIncidents = [...incidents];
    const sortedByDate = allIncidents.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastUpdate = sortedByDate[0]?.created_at || new Date().toISOString();

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: lastUpdate,
      },
      components: components.length > 0 ? components : [],
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "hotmart",
      url: serviceUrl,
    };
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Hotmart status for ${serviceName}:`, error);
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
      statusPageType: "hotmart",
      url: serviceUrl,
    };
  }
}

