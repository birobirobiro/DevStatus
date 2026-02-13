import type { WebsiteData } from "@/types";

interface PagerDutyService {
  name: string;
  id: string;
  is_active: boolean;
  display_name: string;
  status_page_id: string;
  business_service_id: string;
}

interface PagerDutyResponse {
  services?: PagerDutyService[];
}

export async function parsePagerDuty(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/api/services`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: PagerDutyResponse = await response.json();

    const components = data.services
      ? data.services
          .filter((service) => service.is_active)
          .map((service) => ({
            id: service.id,
            name: service.display_name || service.name,
            description: service.name,
            status: "operational",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            position: 0,
            group_id: service.business_service_id || null,
            showcase: false,
          }))
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
        description: "All systems operational",
        indicator: "operational",
      },
      name: serviceName,
      category,
      statusPageType: "pagerduty",
      url: statusPageUrl,
    };
  } catch (error) {
    console.error(`[PagerDuty] Error fetching ${serviceName}:`, error);
    throw error;
  }
}
