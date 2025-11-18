import type { WebsiteData } from "@/types";

interface RSSItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

/**
 * Parse RSS feed from incident.io and determine service status
 */
export async function parseIncidentIoRSS(
  rssUrl: string,
  serviceName: string,
  serviceUrl: string,
  category: string
): Promise<WebsiteData> {
  try {
    // Fetch RSS feed with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let response: Response;
    try {
      response = await fetch(rssUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw new Error("Network error fetching RSS feed");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML (simple parser for RSS 2.0)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Failed to parse RSS XML");
    }

    // Extract channel info
    const channel = xmlDoc.querySelector("channel");
    if (!channel) {
      throw new Error("Invalid RSS format: no channel found");
    }

    const title = channel.querySelector("title")?.textContent || serviceName;
    const link = channel.querySelector("link")?.textContent || serviceUrl;
    const lastBuildDate = channel.querySelector("lastBuildDate")?.textContent || new Date().toISOString();

    // Extract items
    const items = Array.from(xmlDoc.querySelectorAll("item")).map((item) => {
      const titleEl = item.querySelector("title");
      const descEl = item.querySelector("description");
      const pubDateEl = item.querySelector("pubDate");
      const linkEl = item.querySelector("link");

      return {
        title: titleEl?.textContent || "",
        description: descEl?.textContent || "",
        pubDate: pubDateEl?.textContent || "",
        link: linkEl?.textContent || "",
      };
    });

    // Determine status based on most recent items
    // Look for active incidents (not resolved/complete)
    const activeIncidents = items.filter((item) => {
      const desc = item.description.toLowerCase();
      const title = item.title.toLowerCase();
      
      // Check if it's a maintenance (usually scheduled)
      if (title.includes("maintenance")) {
        // Maintenance is active if status is not "Complete"
        return !desc.includes("status: complete") && !desc.includes("maintenance has completed");
      }
      
      // Check for unresolved incidents
      // An incident is active if it's not explicitly marked as resolved or complete
      const isResolved = desc.includes("status: resolved") || 
                        desc.includes("this incident has been resolved") ||
                        desc.includes("this incident has been fully resolved");
      const isComplete = desc.includes("status: complete") ||
                        desc.includes("maintenance has completed");
      
      return !isResolved && !isComplete;
    });

    // Determine status indicator
    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (activeIncidents.length > 0) {
      const mostRecent = activeIncidents[0];
      const desc = mostRecent.description.toLowerCase();
      const title = mostRecent.title.toLowerCase();

      if (title.includes("maintenance")) {
        indicator = "maintenance";
        description = "Scheduled maintenance in progress";
      } else if (desc.includes("critical") || desc.includes("major")) {
        indicator = "major";
        description = mostRecent.title;
      } else if (desc.includes("degraded") || desc.includes("partial")) {
        indicator = "minor";
        description = mostRecent.title;
      } else {
        indicator = "minor";
        description = mostRecent.title;
      }
    }

    // Extract components from items (if available)
    const components: Array<{ id: string; name: string; status: string }> = [];
    
    // Try to extract components from the most recent items
    items.slice(0, 5).forEach((item) => {
      const desc = item.description;
      // Look for component lists in HTML
      const componentMatches = desc.match(/<li>(.*?)<\/li>/g);
      if (componentMatches) {
        componentMatches.forEach((match) => {
          const componentText = match.replace(/<\/?li>/g, "").trim();
          if (componentText && !componentText.includes("Operational")) {
            const statusMatch = componentText.match(/\((.*?)\)/);
            const status = statusMatch ? statusMatch[1] : "Unknown";
            const name = componentText.replace(/\(.*?\)/g, "").trim();
            
            components.push({
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
              status: status === "Operational" ? "operational" : "degraded",
            });
          }
        });
      }
    });

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: lastBuildDate,
      },
      components: components.length > 0 ? components : [],
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "incidentio",
      url: serviceUrl,
    };
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing incident.io RSS for ${serviceName}:`, error);
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
      statusPageType: "incidentio",
      url: serviceUrl,
    };
  }
}

