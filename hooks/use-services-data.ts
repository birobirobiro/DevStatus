import { useQuery } from '@tanstack/react-query';
import { websites } from '@/data/sites';
import { parseIncidentIoRSS } from '@/lib/incidentio-rss';
import { parseHotmartStatus } from '@/lib/hotmart-status';
import { parseAppMaxStatus } from '@/lib/appmax-status';
import { parseStatusIo } from '@/lib/statusio-parser';
import { parseBetterStack } from '@/lib/betterstack-parser';
import { parseInstatus } from '@/lib/instatus-parser';
import { parsePostmarkStatus } from '@/lib/postmark-parser';
import { parseOpenStatus } from '@/lib/openstatus-parser';
import { parseOnlineOrNot } from '@/lib/onlineornot-parser';
import { parseUptimeRobot } from '@/lib/uptimerobot-parser';
import { parseOhDear } from '@/lib/ohdear-parser';
import { parseSalesforce } from '@/lib/salesforce-parser';
import { parseGoogleStatus } from '@/lib/google-parser';
import { parsePagerDuty } from '@/lib/pagerduty-parser';
import { parsePayPalStatus } from '@/lib/paypal-parser';
import { parseXboxStatus } from '@/lib/xbox-parser';
import { parsePlayStationStatus } from '@/lib/playstation-parser';
import { parseUptimeKuma } from '@/lib/uptimekuma-parser';
import type { WebsiteData } from '@/types';

const STALE_TIME = 1000 * 60 * 2;
const GC_TIME = 1000 * 60 * 5;
const CONCURRENCY_LIMIT = 5;

async function fetchWithConcurrency<T>(
  items: T[],
  fetchFn: (item: T) => Promise<WebsiteData>,
  limit: number
): Promise<WebsiteData[]> {
  const results: WebsiteData[] = [];
  
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map(fetchFn));
    results.push(...chunkResults);
  }

  return results;
}

async function fetchServiceData(website: typeof websites[0]): Promise<WebsiteData> {
  // Handle incident.io RSS feeds
  if (website.statusPageType === "incidentio") {
    const baseUrl = website.url.replace(/\/$/, "");
    const rssUrl = `${baseUrl}/feed.rss`;
    try {
      return await parseIncidentIoRSS(rssUrl, website.name, website.url, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Hotmart status API
  if (website.statusPageType === "hotmart") {
    try {
      return await parseHotmartStatus(website.name, website.url, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle AppMax status API
  if (website.statusPageType === "appmax") {
    try {
      const baseUrl = `https://${new URL(website.url).hostname}`;
      return await parseAppMaxStatus(website.url, website.name, baseUrl, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Status.io API
  if (website.statusPageType === "statusio") {
    try {
      return await parseStatusIo(website.url, website.name, website.url, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Better Stack API
  if (website.statusPageType === "betterstack") {
    try {
      return await parseBetterStack(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Instatus API
  if (website.statusPageType === "instatus") {
    try {
      return await parseInstatus(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Postmark API
  if (website.statusPageType === "postmark") {
    try {
      return await parsePostmarkStatus(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle OpenStatus API
  if (website.statusPageType === "openstatus") {
    try {
      return await parseOpenStatus(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle OnlineOrNot API
  if (website.statusPageType === "onlineornot") {
    try {
      return await parseOnlineOrNot(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle OhDear API
  if (website.statusPageType === "ohdear") {
    try {
      return await parseOhDear(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Salesforce API
  if (website.statusPageType === "salesforce") {
    try {
      return await parseSalesforce(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle PagerDuty API
  if (website.statusPageType === "pagerduty") {
    try {
      return await parsePagerDuty(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle PayPal API
  if (website.statusPageType === "paypal") {
    try {
      const baseUrl = `https://${new URL(website.url).hostname}`;
      return await parsePayPalStatus(baseUrl, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle TikTok RSS API
  if (website.statusPageType === "tiktok") {
    const rssUrl = `${website.url}/rss/`;
    try {
      return await parseIncidentIoRSS(rssUrl, website.name, website.url, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle UptimeRobot API
  if (website.statusPageType === "uptimerobot") {
    try {
      return await parseUptimeRobot(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Xbox API
  if (website.statusPageType === "xbox") {
    try {
      return await parseXboxStatus(website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle PlayStation API
  if (website.statusPageType === "playstation") {
    try {
      return await parsePlayStationStatus(website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Uptime Kuma API
  if (website.statusPageType === "uptimekuma") {
    try {
      return await parseUptimeKuma(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle Google Status API
  if (website.statusPageType === "google") {
    try {
      return await parseGoogleStatus(website.url, website.name, website.category);
    } catch (error) {
      return createErrorData(website);
    }
  }

  // Handle external-only services
  const isExternalOnlyService =
    website.statusPageType === "azure" ||
    website.statusPageType === "jenkins" ||
    website.statusPageType === "adobe" ||
    website.statusPageType === "sketch" ||
    website.statusPageType === "apple" ||
    website.statusPageType === "custom" ||
    website.statusPageType === "statuspal" ||
    website.statusPageType === "microsoft" ||
    (!website.url.includes("api/v2/summary.json") &&
      !website.url.includes("api/v2/status.json"));

  if (isExternalOnlyService) {
    return {
      page: {
        id: website.name,
        name: website.name,
        url: website.url,
        updated_at: new Date().toISOString(),
      },
      components: [],
      status: {
        description: "External status page",
        indicator: "external",
      },
      name: website.name,
      category: website.category,
      statusPageType: website.statusPageType,
      url: website.url,
    };
  }

  // Default: Try to fetch from Statuspage API
  try {
    const isClient = typeof window !== 'undefined';
    const origin = isClient ? window.location.origin : 'http://localhost:3000';
    const needsProxy = !website.url.startsWith(origin) &&
      (website.url.includes('api/v2/summary.json') ||
       website.url.includes('api/v2/status.json'));

    const fetchUrl = needsProxy
      ? `/api/proxy/json?url=${encodeURIComponent(website.url)}`
      : website.url;

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(`Response is not JSON: ${contentType}`);
    }

    const fetchedData = await response.json();
    return {
      ...fetchedData,
      name: website.name,
      category: website.category,
      statusPageType: website.statusPageType,
      url: website.url,
    };
  } catch (error) {
    console.error(`[useServicesData] Error fetching ${website.name}:`, error);
    return createErrorData(website);
  }
}

function createErrorData(website: typeof websites[0]): WebsiteData {
  return {
    page: {
      id: website.name,
      name: website.name,
      url: website.url,
      updated_at: new Date().toISOString(),
    },
    components: [],
    status: {
      description: "Error fetching status",
      indicator: "error",
    },
    name: website.name,
    category: website.category,
    statusPageType: website.statusPageType,
    url: website.url,
  };
}

export function useServicesData() {
  return useQuery<WebsiteData[]>({
    queryKey: ['services-data'],
    queryFn: async () => {
      const data = await fetchWithConcurrency(websites, fetchServiceData, CONCURRENCY_LIMIT);
      return data.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
}

// Hook for a single service (used in service detail page)
export function useServiceData(serviceName: string) {
  return useQuery<WebsiteData | null>({
    queryKey: ['service-data', serviceName],
    queryFn: async () => {
      const website = websites.find(w => w.name === serviceName);
      if (!website) return null;
      return await fetchServiceData(website);
    },
    enabled: !!serviceName,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Evita refazer fetch ao voltar da navegação
    initialData: () => {
      const cachedData = (window as unknown as { queryClient?: { getQueryData<T>(key: readonly unknown[]): T | undefined } })
        .queryClient?.getQueryData<WebsiteData[]>(['services-data']);
      return cachedData?.find((d: WebsiteData) => d.name === serviceName) || null;
    },
  });
}
