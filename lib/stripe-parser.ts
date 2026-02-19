import type { WebsiteData } from "@/types";

interface AtomEntry {
  title: string;
  content: string;
  published: string;
  updated: string;
  link: string;
}

export async function parseStripeStatus(
  serviceName: string,
  serviceUrl: string,
  category: string
): Promise<WebsiteData> {
  const rssUrl = "https://www.stripestatus.com/history.atom";

  try {
    const proxyUrl = `/api/proxy/rss?url=${encodeURIComponent(rssUrl)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(proxyUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw new Error("Network error fetching Stripe RSS feed");
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Stripe RSS: ${response.statusText}`);
    }

    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      throw new Error("Failed to parse Stripe RSS XML");
    }

    const feed = xmlDoc.querySelector("feed");
    if (!feed) {
      throw new Error("Invalid Atom format: no feed found");
    }

    const updated = feed.querySelector("updated")?.textContent || new Date().toISOString();

    const entries = Array.from(feed.querySelectorAll("entry")).map((entry) => {
      const titleEl = entry.querySelector("title");
      const contentEl = entry.querySelector("content");
      const publishedEl = entry.querySelector("published");
      const updatedEl = entry.querySelector("updated");
      const linkEl = entry.querySelector("link");

      return {
        title: titleEl?.textContent || "",
        content: contentEl?.textContent || "",
        published: publishedEl?.textContent || "",
        updated: updatedEl?.textContent || "",
        link: linkEl?.getAttribute("href") || "",
      };
    });

    const now = new Date();
    const activeIncidents = entries.filter((entry) => {
      const content = entry.content.toLowerCase();
      const title = entry.title.toLowerCase();
      const published = entry.published;

      const pubDate = new Date(published);
      if (isNaN(pubDate.getTime())) return false;

      const isScheduledMaintenance = title.includes("scheduled maintenance") || 
                                      content.includes("scheduled maintenance") ||
                                      content.includes("this is a scheduled event");

      const isPast = pubDate < now;
      if (isScheduledMaintenance && !isPast) {
        return true;
      }

      if (isScheduledMaintenance && isPast) {
        return false;
      }

      const isResolved = content.includes("resolved") || 
                        content.includes("this incident has been resolved");
      
      return !isResolved;
    });

    let indicator: "none" | "minor" | "major" | "critical" | "maintenance" | "error" = "none";
    let description = "All systems operational";

    if (activeIncidents.length > 0) {
      const mostRecent = activeIncidents[0];
      const content = mostRecent.content.toLowerCase();
      const title = mostRecent.title.toLowerCase();

      if (title.includes("scheduled maintenance") || content.includes("this is a scheduled event")) {
        indicator = "maintenance";
        description = mostRecent.title;
      } else if (content.includes("critical") || content.includes("outage")) {
        indicator = "critical";
        description = mostRecent.title;
      } else if (content.includes("degraded") || content.includes("partial") || content.includes("major")) {
        indicator = "major";
        description = mostRecent.title;
      } else {
        indicator = "minor";
        description = mostRecent.title;
      }
    }

    const components: Array<{ id: string; name: string; status: string }> = [];

    entries.slice(0, 10).forEach((entry) => {
      const title = entry.title;
      
      if (title.includes("maintenance for")) {
        const componentName = title.replace(/scheduled maintenance for/i, "").trim();
        if (componentName) {
          components.push({
            id: componentName.toLowerCase().replace(/\s+/g, "-"),
            name: componentName,
            status: "operational",
          });
        }
      }
    });

    return {
      page: {
        id: serviceName.toLowerCase().replace(/\s+/g, "-"),
        name: serviceName,
        url: serviceUrl,
        updated_at: updated,
      },
      components: components.slice(0, 5),
      status: {
        description,
        indicator,
      },
      name: serviceName,
      category,
      statusPageType: "stripe",
      url: serviceUrl,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`Error parsing Stripe RSS for ${serviceName}:`, error);
    }

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
      statusPageType: "stripe",
      url: serviceUrl,
    };
  }
}
