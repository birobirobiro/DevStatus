import type { WebsiteData } from "@/types";

interface GoogleProduct {
  title: string;
  id: string;
}

interface GoogleIncident {
  id: string;
  number: string;
  begin: string;
  end: string | null;
  external_desc: string;
}

export async function parseGoogleStatus(
  statusPageUrl: string,
  serviceName: string,
  category: string
): Promise<WebsiteData> {
  const productsUrl = "https://www.google.com/appsstatus/dashboard/products.json";
  const incidentsUrl = "https://www.google.com/appsstatus/dashboard/incidents.json";

  try {
    let productsResponse: Response;
    let incidentsResponse: Response;

    try {
      productsResponse = await fetch(`/api/proxy/json?url=${encodeURIComponent(productsUrl)}`);
      incidentsResponse = await fetch(`/api/proxy/json?url=${encodeURIComponent(incidentsUrl)}`);
    } catch {
      productsResponse = await fetch(productsUrl);
      incidentsResponse = await fetch(incidentsUrl);
    }

    if (!productsResponse.ok || !incidentsResponse.ok) {
      return {
        page: { id: serviceName, name: serviceName, url: statusPageUrl, updated_at: new Date().toISOString() },
        components: [],
        status: { description: "All systems operational", indicator: "operational" },
        name: serviceName,
        category,
        statusPageType: "google",
        url: statusPageUrl,
      };
    }

    const productsData: { products: GoogleProduct[] } = await productsResponse.json();
    const incidentsData: GoogleIncident[] = await incidentsResponse.json();

    const productMap = new Map(productsData.products.map((p) => [p.id, p.title]));

    const serviceKey = serviceName.toLowerCase().replace(/[^a-z]/g, "");
    const productId = Array.from(productMap.entries()).find(([, name]) => {
      const normalizedName = name.toLowerCase().replace(/[^a-z]/g, "");
      return normalizedName.includes(serviceKey) || serviceKey.includes(normalizedName);
    })?.[0];

    const activeIncidents = incidentsData.filter(
      (incident) => !incident.end || new Date(incident.end) > new Date()
    );

    const serviceIncidents = productId
      ? activeIncidents.filter((incident) => incident.id.includes(productId))
      : [];

    const hasIssues = serviceIncidents.length > 0;

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
          ? `${serviceIncidents.length} active incident(s)`
          : "All systems operational",
        indicator: hasIssues ? "major_outage" : "operational",
      },
      name: serviceName,
      category,
      statusPageType: "google",
      url: statusPageUrl,
    };
  } catch (error) {
    console.error(`[Google] Error fetching ${serviceName}:`, error);
    return {
      page: { id: serviceName, name: serviceName, url: statusPageUrl, updated_at: new Date().toISOString() },
      components: [],
      status: { description: "All systems operational", indicator: "operational" },
      name: serviceName,
      category,
      statusPageType: "google",
      url: statusPageUrl,
    };
  }
}
