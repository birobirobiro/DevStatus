"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/service-card";
import { StatsOverview } from "@/components/stats-overview";
import { websites } from "@/data/sites";
import {
  Search,
  Zap,
  Github,
  Share2,
  PartyPopper,
} from "lucide-react";
import type { WebsiteData } from "@/types";
import { ContributeButton } from "@/components/contribute-button";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/toaster";
import { LiveIndicator } from "@/components/live-indicator";
import { EmptyState } from "@/components/empty-state";
import { ScrollToTop } from "@/components/scroll-to-top";
import Head from "next/head";
import { useToast } from "@/components/ui/use-toast";
import { ReportsStorage } from "@/lib/reports-storage";
import { FavoritesStorage } from "@/lib/favorites-storage";

export default function HomePage() {
  const [websiteData, setWebsiteData] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const categories = Array.from(
    new Set(websites.map((site) => site.category))
  ).sort();

  const fetchData = async () => {
    try {
      setLoading(true);
      const dataPromises = websites.map(async (website) => {
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
          website.statusPageType === "incidentio" ||
          website.statusPageType === "statuspal" ||
          website.statusPageType === "instatus" ||
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
          } as WebsiteData;
        }

        try {
          const fetchedData = await getStatus(website.url);
          return {
            ...fetchedData,
            name: website.name,
            category: website.category,
            statusPageType: website.statusPageType,
            url: website.url,
          } as WebsiteData;
        } catch (error) {
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
          } as WebsiteData;
        }
      });

      const resolvedData = await Promise.all(dataPromises);
      const sortedData = resolvedData.sort((a, b) =>
        a.page.name.localeCompare(b.page.name)
      );
      setWebsiteData(sortedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return await response.json();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleShare = async () => {
    try {
      if (navigator.share && typeof navigator.canShare === "function") {
        const shareData = {
          title: "DevStatus - Developer Tools Status",
          text: "Check the current status of developer tools and services",
          url: window.location.href,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The page URL has been copied to your clipboard.",
      });
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The page URL has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        const url = window.location.href;
        toast({
          title: "Share this page",
          description: `Copy this URL: ${url}`,
          duration: 10000,
        });
      }
    }
  };


  // Enhanced filtering logic
  const filteredWebsites = websiteData
    .filter((data) =>
      data.page.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((data) =>
      selectedCategory ? data.category === selectedCategory : true
    )
    .filter((data) => {
      if (statusFilter === "all") return true;
      
      if (statusFilter === "operational") {
        return (
          data.status.indicator === "none" ||
          data.status.description.toLowerCase().includes("operational")
        );
      }
      
      if (statusFilter === "issues") {
        return (
          data.status.indicator !== "none" &&
          !data.status.description.toLowerCase().includes("operational") &&
          data.status.indicator !== "external" &&
          data.status.indicator !== "error"
        );
      }

      if (statusFilter === "trending") {
        const trendingServices = ReportsStorage.getTrendingServices(100);
        return trendingServices.some(s => s.serviceName === data.name);
      }

      if (statusFilter === "favorites") {
        return FavoritesStorage.isFavorite(data.name);
      }
      
      return true;
    });

  // Count services by status type
  const stats = {
    total: websiteData.length,
    operational: websiteData.filter(
      (d) =>
        d.status.indicator === "none" ||
        d.status.description.toLowerCase().includes("operational")
    ).length,
    issues: websiteData.filter(
      (d) =>
        d.status.indicator !== "none" &&
        !d.status.description.toLowerCase().includes("operational") &&
        d.status.indicator !== "external" &&
        d.status.indicator !== "error"
    ).length,
    unknown: websiteData.filter((d) => d.status.indicator === "error").length,
    external: websiteData.filter((d) => d.status.indicator === "external").length,
  };

  const getEmptyStateProps = () => {
    if (statusFilter === "operational") {
      return {
        icon: CheckCircle,
        title: "No operational services found",
        description: "Try adjusting your filters or search query",
      };
    }
    if (statusFilter === "issues") {
      return {
        icon: PartyPopper,
        title: "No issues found! 🎉",
        description: "All services are running smoothly",
        showConfetti: true,
      };
    }
    if (statusFilter === "trending") {
      return {
        icon: TrendingUp,
        title: "No trending issues",
        description: "No services have high activity right now",
      };
    }
    if (statusFilter === "favorites") {
      return {
        icon: Heart,
        title: "No favorites yet",
        description: "Click the star icon on any service card to add it to your favorites",
      };
    }
    return {
      icon: Search,
      title: "No services found",
      description: "Try adjusting your search or filter criteria",
    };
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://devstatus.vercel.app" />
        <meta name="robots" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "DevStatus",
              description:
                "Real-time status monitoring for developer tools and services",
              url: "https://devstatus.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <Zap className="w-6 h-6 text-zinc-100" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-zinc-100">DevStatus</h1>
                <p className="text-sm text-zinc-400">Real-time monitoring</p>
              </div>
              <LiveIndicator lastUpdated={lastUpdated} />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <RefreshButton onRefresh={fetchData} />
              <ContributeButton />
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
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
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              </Button>
            </div>

          </div>

          {/* Stats Overview */}
          <StatsOverview
            stats={stats}
            loading={loading}
            onStatusFilter={handleStatusFilter}
            currentFilter={statusFilter}
          />

          {/* Search and Filters - Redesigned */}
          <Card className="mb-8 bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search developer tools and services..."
                  className="pl-12 h-12 text-base bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600"
                />
              </div>

              {/* Categories - Horizontal Scroll */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">Categories</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className={`cursor-pointer px-4 py-2 whitespace-nowrap ${
                      selectedCategory === null
                        ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All ({websiteData.length})
                  </Badge>
                  {categories.map((category) => {
                    const count = websiteData.filter((d) => d.category === category).length;
                    return (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 whitespace-nowrap ${
                          selectedCategory === category
                            ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category} ({count})
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          {filteredWebsites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebsites.map((website, index) => (
                <div
                  key={website.page.id}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ServiceCard website={website} loading={loading} />
                </div>
              ))}
            </div>
          ) : (
            !loading && <EmptyState {...getEmptyStateProps()} />
          )}
        </div>
        <ScrollToTop />
        <Toaster />
      </div>
    </>
  );
}

