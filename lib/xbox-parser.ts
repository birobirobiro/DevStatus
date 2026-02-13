import type { WebsiteData } from "@/types";

interface XboxStatus {
  Name: string;
  Id: number;
}

interface XboxScenario {
  Id: number;
  Status: XboxStatus;
  Name: string;
  Devices: Array<{
    Id: number;
    Name: string;
  }>;
  Incidents: Array<{
    Id: number;
    Begin: string;
    End: string | null;
    EstimatedEndTime: string | null;
    Stage: {
      Id: number;
      Message: string;
    };
    ImpactedDevices: number[];
    Status: XboxStatus;
    LevelOfImpact: {
      Id: number;
      Name: string;
    };
  }>;
  Description: string;
}

interface XboxService {
  Id: number;
  Name: string;
  Status: XboxStatus;
  Scenarios: XboxScenario[];
}

interface XboxResponse {
  Status: {
    Overall: {
      State: string;
      Id: number;
      LastUpdated: string;
    };
    SelectedScenarios: {
      State: string;
      Id: number;
      LastUpdated: string;
    };
  };
  CoreServices: XboxService[];
  Titles: XboxService[];
}

/**
 * Parse Xbox Live status API
 * Endpoint: https://xnotify.xboxlive.com/servicestatusv6/US/en-US
 */
export async function parseXboxStatus(
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const apiUrl = "https://xnotify.xboxlive.com/servicestatusv6/US/en-US";
    
    // Fetch status with timeout
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
      throw new Error("Network error fetching Xbox status");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Xbox status: ${response.statusText}`);
    }

    const data: XboxResponse = await response.json();

    // Determine overall status
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    const overallState = data.Status?.Overall?.State?.toLowerCase() || "none";
    
    // Map Xbox status states
    switch (overallState) {
      case "none":
        indicator = "none";
        description = "All systems operational";
        break;
      case "impacted":
        indicator = "major";
        description = "Some services are impacted";
        break;
      case "degraded":
        indicator = "minor";
        description = "Some services are experiencing degraded performance";
        break;
      case "maintenance":
        indicator = "maintenance";
        description = "Scheduled maintenance in progress";
        break;
      default:
        indicator = "none";
    }

    // Check for active incidents in CoreServices
    const activeIncidents: string[] = [];
    const impactedServices = new Set<string>();

    // Check CoreServices
    data.CoreServices?.forEach((service) => {
      service.Scenarios?.forEach((scenario) => {
        const activeScenarioIncidents = scenario.Incidents?.filter(
          (incident) => !incident.End && incident.Status?.Name !== "Resolved"
        );
        
        if (activeScenarioIncidents?.length > 0) {
          impactedServices.add(service.Name);
          activeIncidents.push(scenario.Name);
        }
      });
    });

    // Check Titles (Games & Apps)
    data.Titles?.forEach((title) => {
      title.Scenarios?.forEach((scenario) => {
        const activeScenarioIncidents = scenario.Incidents?.filter(
          (incident) => !incident.End && incident.Status?.Name !== "Resolved"
        );
        
        if (activeScenarioIncidents?.length > 0) {
          impactedServices.add(title.Name);
          activeIncidents.push(`${title.Name}: ${scenario.Name}`);
        }
      });
    });

    if (activeIncidents.length > 0) {
      // Get the most impactful status
      const hasCritical = data.CoreServices?.some(
        (s) => s.Status?.Name?.toLowerCase() === "critical"
      );
      
      if (hasCritical) {
        indicator = "critical";
      } else {
        indicator = "major";
      }
      
      description = activeIncidents.slice(0, 2).join("; ");
      if (activeIncidents.length > 2) {
        description += ` and ${activeIncidents.length - 2} more issues`;
      }
    }

    // Map CoreServices as components
    const mappedComponents = data.CoreServices?.map((service) => {
      const status = service.Status?.Name?.toLowerCase() || "none";
      let statusText = "operational";
      
      if (status === "impacted") {
        statusText = "degraded";
      } else if (status === "degraded") {
        statusText = "degraded";
      } else if (status === "maintenance") {
        statusText = "maintenance";
      } else if (status !== "none") {
        statusText = status;
      }

      return {
        id: String(service.Id),
        name: service.Name,
        status: statusText,
      };
    }) || [];

    const lastUpdated = data.Status?.Overall?.LastUpdated || new Date().toISOString();

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: "https://support.xbox.com/en-US/xbox-live-status",
        updated_at: lastUpdated,
      },
      components: mappedComponents,
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "xbox",
      url: "https://support.xbox.com/en-US/xbox-live-status",
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Xbox status for ${serviceName}:`, error);
    }

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: "https://support.xbox.com/en-US/xbox-live-status",
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: "Error fetching status",
        indicator: "error",
      },
      name: serviceName,
      category,
      statusPageType: "xbox",
      url: "https://support.xbox.com/en-US/xbox-live-status",
    };
  }
}
