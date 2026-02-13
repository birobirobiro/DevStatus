import type { WebsiteData } from "@/types";

interface SalesforceMessage {
  id: number;
  subject: string;
  body: string;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface SalesforceResponse {
  subject: string;
  status: string;
}

export async function parseSalesforce(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  try {
    const baseUrl = statusPageUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/api/generalMessages/`;

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

    const data: SalesforceMessage[] = await response.json();

    const activeIncidents = data.filter(
      (msg) => msg.status === "Active" && !msg.endDate
    );

    const hasIssues = activeIncidents.length > 0;

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: statusPageUrl,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: hasIssues
          ? `${activeIncidents.length} active incident(s)`
          : "All systems operational",
        indicator: hasIssues ? "major_outage" : "operational",
      },
      name: serviceName,
      category,
      statusPageType: "salesforce",
      url: statusPageUrl,
    };
  } catch (error) {
    console.error(`[Salesforce] Error fetching ${serviceName}:`, error);
    throw error;
  }
}
