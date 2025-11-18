"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { websites } from "@/data/sites";
import type { WebsiteData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  MessageSquare,
  TrendingUp,
  Globe,
  Github,
  Heart,
} from "lucide-react";
import { ReportButton } from "@/components/report-button";
import { ReportsChart } from "@/components/reports-chart";
import { GitHubCommentsSection } from "@/components/github-comments-section";
import { EmptyState } from "@/components/empty-state";
import { ScrollToTop } from "@/components/scroll-to-top";
import { getServiceIcon } from "@/services/service-icons";
import { LogoFetcher } from "@/services/logo-fetcher";
import { ReportsStorage } from "@/lib/reports-storage";
import { FavoritesStorage } from "@/lib/favorites-storage";
import { useToast } from "@/components/ui/use-toast";
import { parseIncidentIoRSS } from "@/lib/incidentio-rss";
import { parseHotmartStatus } from "@/lib/hotmart-status";
import { parseAppMaxStatus } from "@/lib/appmax-status";

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [serviceData, setServiceData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [reportStats, setReportStats] = useState({ lastHour: 0, last24Hours: 0 });

  const serviceId = params.id as string;

  useEffect(() => {
    const loadService = async () => {
      const website = websites.find((w) => w.name.toLowerCase().replace(/\s+/g, "-") === serviceId);

      if (!website) {
        // Preserve query params when redirecting
        const params = new URLSearchParams(searchParams.toString());
        const queryString = params.toString();
        const homeUrl = queryString ? `/?${queryString}` : "/";
        router.push(homeUrl);
        return;
      }

      setLoading(true);

      try {
        // Load logo (silently fail if logo fetch fails)
        LogoFetcher.fetchLogo(website.name)
          .then((result) => {
            if (result) setLogoUrl(result.url);
          })
          .catch(() => {
            // Silently handle logo fetch errors
          });

        // Handle incident.io RSS feeds
        if (website.statusPageType === "incidentio") {
          const baseUrl = website.url.replace(/\/$/, "");
          const rssUrl = `${baseUrl}/feed.rss`;
          
          try {
            const data = await parseIncidentIoRSS(
              rssUrl,
              website.name,
              website.url,
              website.category
            );
            setServiceData(data);
          } catch (error) {
            // parseIncidentIoRSS already returns error state, but catch here as fallback
            if (process.env.NODE_ENV === "development") {
              console.debug(`Error fetching incident.io RSS for ${website.name}:`, error);
            }
            setServiceData({
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
            });
          }
        } else if (website.statusPageType === "hotmart") {
          // Handle Hotmart status API
          try {
            const data = await parseHotmartStatus(
              website.name,
              website.url,
              website.category
            );
            setServiceData(data);
          } catch (error) {
            // parseHotmartStatus already returns error state, but catch here as fallback
            if (process.env.NODE_ENV === "development") {
              console.debug(`Error fetching Hotmart status for ${website.name}:`, error);
            }
            setServiceData({
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
            });
          }
        } else if (website.statusPageType === "appmax") {
          // Handle AppMax status API
          try {
            const baseUrl = `https://${new URL(website.url).hostname}`;
            const data = await parseAppMaxStatus(
              website.url, // The URL is the API endpoint
              website.name,
              baseUrl,
              website.category
            );
            setServiceData(data);
          } catch (error) {
            // parseAppMaxStatus already returns error state, but catch here as fallback
            if (process.env.NODE_ENV === "development") {
              console.debug(`Error fetching AppMax status for ${website.name}:`, error);
            }
            setServiceData({
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
            });
          }
        } else {
          // Check if external service
          const isExternalOnlyService =
            website.statusPageType === "google" ||
            website.statusPageType === "azure" ||
            website.statusPageType === "jenkins" ||
            website.statusPageType === "adobe" ||
            website.statusPageType === "sketch" ||
            website.statusPageType === "apple" ||
            website.statusPageType === "custom" ||
            website.statusPageType === "betterstack" ||
            website.statusPageType === "statusio" ||
            website.statusPageType === "statuspal" ||
            website.statusPageType === "instatus" ||
            website.statusPageType === "microsoft";

          if (isExternalOnlyService) {
            setServiceData({
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
            });
          } else {
            try {
              const response = await fetch(website.url);
              const data = await response.json();
              setServiceData({
                ...data,
                name: website.name,
                category: website.category,
                statusPageType: website.statusPageType,
                url: website.url,
              });
            } catch (error) {
              console.error("Error fetching service data:", error);
              setServiceData({
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
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading service:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }

      // Load report stats
      const stats = ReportsStorage.getReportStats(website.name);
      setReportStats(stats);
    };

    loadService();

    const handleUpdate = () => {
      if (serviceData) {
        const stats = ReportsStorage.getReportStats(serviceData.name);
        setReportStats(stats);
      }
    };

    window.addEventListener("reportsUpdated", handleUpdate);
    return () => window.removeEventListener("reportsUpdated", handleUpdate);
  }, [serviceId, router]);

  if (loading || !serviceData) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <Skeleton className="h-10 w-32 mb-8 bg-zinc-800" />
          <Skeleton className="h-64 w-full mb-8 bg-zinc-800" />
          <Skeleton className="h-96 w-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    const desc = serviceData.status.description?.toLowerCase();
    const indicator = serviceData.status.indicator?.toLowerCase();

    if (desc === "all systems operational" || indicator === "none") {
      return {
        icon: CheckCircle,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        label: "Operational",
      };
    }
    if (desc?.includes("outage") || indicator === "major" || indicator === "critical") {
      return {
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        label: "Major Outage",
      };
    }
    if (desc?.includes("partial") || desc?.includes("degraded") || indicator === "minor") {
      return {
        icon: AlertTriangle,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        label: "Degraded",
      };
    }
    return {
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      label: "Operational",
    };
  };

  const statusInfo = getStatusInfo();
  const ServiceIcon = getServiceIcon(serviceData.name);
  const isExternalService = serviceData.status.indicator === "external";

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            // Preserve query params when going back
            const params = new URLSearchParams(searchParams.toString());
            const queryString = params.toString();
            const backUrl = queryString ? `/?${queryString}` : "/";
            
            // Try to go back in history, fallback to home with params
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(backUrl);
            }
          }}
          className="mb-8 text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Services
        </Button>

        {/* Service Header */}
        <Card className="mb-8 bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${serviceData.name} logo`}
                      className="w-12 h-12 object-contain brightness-0 invert opacity-80"
                      onError={() => setLogoUrl(null)}
                    />
                  ) : (
                    <ServiceIcon className="w-10 h-10 text-zinc-300" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold text-zinc-100">{serviceData.name}</h1>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                    {serviceData.category}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                    <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                    <span className={`font-medium ${statusInfo.color}`}>
                      {serviceData.status.description || statusInfo.label}
                    </span>
                  </div>

                  {reportStats.lastHour > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <span className="font-medium text-orange-400">
                        {reportStats.lastHour} user report{reportStats.lastHour !== 1 ? "s" : ""} in last hour
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(serviceData.page.url || serviceData.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Status Page
                </Button>
                <ReportButton serviceId={serviceData.name} serviceName={serviceData.name} variant="default" />
              </div>
            </div>

            <Separator className="my-6 bg-zinc-800" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-zinc-500 mb-1">Last Updated</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(serviceData.page.updated_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Components</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Activity className="w-4 h-4" />
                  <span>{serviceData.components?.length || 0}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Reports (24h)</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-4 h-4" />
                  <span>{reportStats.last24Hours}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Community</div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ReportsStorage.getCommentsByService(serviceData.name).length} comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Components Status */}
            {!isExternalService && serviceData.components && serviceData.components.length > 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Service Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...serviceData.components]
                      .sort((a, b) => {
                        // Components with problems first
                        const aIsOperational = a.status === "operational";
                        const bIsOperational = b.status === "operational";
                        
                        if (aIsOperational && !bIsOperational) return 1;
                        if (!aIsOperational && bIsOperational) return -1;
                        
                        // If both have same operational status, maintain original order
                        return 0;
                      })
                      .map((component) => (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              component.status === "operational"
                                ? "bg-emerald-500"
                                : component.status.includes("outage")
                                ? "bg-red-500"
                                : "bg-orange-500"
                            }`}
                          />
                          <span className="text-zinc-300 font-medium">{component.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            component.status === "operational"
                              ? "border-emerald-500/30 text-emerald-400"
                              : component.status.includes("outage")
                              ? "border-red-500/30 text-red-400"
                              : "border-orange-500/30 text-orange-400"
                          }
                        >
                          {component.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : isExternalService ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Globe}
                    title="External Status Page"
                    description={`${serviceData.name} uses an external status page that doesn't provide API access. Visit their official status page to see detailed component information.`}
                    actionLabel="Visit Status Page"
                    onAction={() => window.open(serviceData.page?.url || serviceData.url, "_blank")}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="py-12">
                  <EmptyState
                    icon={Activity}
                    title="No Component Details Available"
                    description="This service doesn't expose individual component status information."
                  />
                </CardContent>
              </Card>
            )}

            {/* User Reports Chart */}
            <ReportsChart serviceId={serviceData.name} serviceName={serviceData.name} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            <ReportsChart serviceId={serviceData.name} serviceName={serviceData.name} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6 mt-6">
            <GitHubCommentsSection serviceId={serviceData.name} serviceName={serviceData.name} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-zinc-400 text-sm mb-2">
                Monitoring {serviceData.name} • Data refreshes automatically
              </p>
              <p className="text-xs text-zinc-500">
                Community-driven reports • Help us improve by sharing your experience
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Preserve query params when going back
                  const params = new URLSearchParams(searchParams.toString());
                  const queryString = params.toString();
                  const backUrl = queryString ? `/?${queryString}` : "/";
                  
                  // Try to go back in history, fallback to home with params
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push(backUrl);
                  }
                }}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Services
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-zinc-400 hover:text-zinc-200"
              >
                <a
                  href="https://github.com/birobirobiro/DevStatus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const isFav = FavoritesStorage.isFavorite(serviceData.name);
                  FavoritesStorage.toggleFavorite(serviceData.name);
                  window.dispatchEvent(new CustomEvent("favoritesUpdated"));
                  toast({
                    title: isFav ? "Removed from favorites" : "Added to favorites",
                    description: isFav ? `${serviceData.name} removed from your favorites` : `${serviceData.name} added to your favorites`,
                  });
                }}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <Heart className={`h-4 w-4 ${FavoritesStorage.isFavorite(serviceData.name) ? "fill-pink-400 text-pink-400" : ""}`} />
              </Button>
            </div>
          </div>
        </footer>
      </div>

      <ScrollToTop />
    </div>
  );
}

