import type { WebsiteData } from "@/types";

/**
 * Parse PlayStation Network status
 * PlayStation uses a client-side rendered status page
 * For now, we mark it as external-only since the API is not easily accessible
 */
export async function parsePlayStationStatus(
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  // PlayStation status page is client-side rendered with JavaScript
  // The status data is loaded dynamically, making it difficult to fetch server-side
  // We return an external-only status for now
  return {
    page: {
      id: serviceName.toLowerCase().replace(/\s+/g, "-"),
      name: serviceName,
      url: "https://status.playstation.com/en-us/",
      updated_at: new Date().toISOString(),
    },
    components: [],
    status: {
      description: "External status page",
      indicator: "external",
    },
    name: serviceName,
    category,
    statusPageType: "playstation",
    url: "https://status.playstation.com/en-us/",
  };
}
