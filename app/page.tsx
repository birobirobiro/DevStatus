"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/service-card";
import { ServiceCardSkeleton } from "@/components/service-card-skeleton";
import { StatsOverview } from "@/components/stats-overview";
import { websites } from "@/data/sites";
import {
  Search,
  Zap,
  Github,
  Share2,
  PartyPopper,
  CheckCircle,
  TrendingUp,
  Heart,
} from "lucide-react";
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
import { useQueryState, parseAsString } from "nuqs";
import { useServicesData } from "@/hooks/use-services-data";
import { SearchBar } from "@/components/siddz-ui/search-bar";
import { FilterSelector } from "@/components/siddz-ui/filter-selector";
import { useQueryClient } from "@tanstack/react-query";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsString.withDefault("")
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all")
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: websiteData = [], isLoading: loading, isFetching: fetching, refetch } = useServicesData();
  const queryClient = useQueryClient();

  // Get unique categories for filter options
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(websiteData.map((w) => w.category)));
    return uniqueCategories.sort();
  }, [websiteData]);

  // Configure filter items for FilterSelector
  const filterItems = useMemo(() => [
    { id: "all", label: "All", color: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700" },
    ...categories.map((cat) => ({
      id: cat,
      label: cat,
      color: "bg-zinc-800/50 text-zinc-300 border-zinc-700 hover:bg-zinc-700",
    })),
  ], [categories]);

  // Active filters state
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);

  // Handle status filter change - clear search and category when filtering by status
  const handleStatusFilter = useCallback((status: string) => {
    if (searchQuery) {
      setSearchQuery(null);
    }
    if (selectedCategory) {
      setSelectedCategory(null);
    }
    setStatusFilter(status);
  }, [searchQuery, selectedCategory, setSearchQuery, setSelectedCategory, setStatusFilter]);

  // Handle category filter change - clear search when filtering by category
  const handleCategoryFilter = useCallback((category: string) => {
    if (searchQuery) {
      setSearchQuery(null);
    }
    setSelectedCategory(category === selectedCategory ? "" : category);
  }, [searchQuery, selectedCategory, setSearchQuery, setSelectedCategory]);

  // Debounce search query for performance (increased to 300ms for better UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-focus search on mount
  useEffect(() => {
    // Focus immediately on mount
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update lastUpdated when data changes
  useEffect(() => {
    if (websiteData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [websiteData]);

  // Handle filter changes from FilterSelector
  const handleFilterChange = useCallback((newFilters: string[]) => {
    setActiveFilters(newFilters);
    
    // Handle category filter
    const selectedCategoryFilter = newFilters.find(f => f !== "all" && categories.includes(f));
    if (selectedCategoryFilter) {
      setSelectedCategory(selectedCategoryFilter);
    } else if (newFilters.includes("all") || newFilters.length === 0) {
      setSelectedCategory("");
    }
  }, [categories, setSelectedCategory]);

  const handleRefresh = useCallback(async () => {
    // Invalidate cache to force fresh data fetch
    await queryClient.invalidateQueries({ queryKey: ['services-data'] });
    await refetch();
    setLastUpdated(new Date());
  }, [queryClient, refetch]);

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

  // Enhanced filtering logic - memoized for performance
  const filteredWebsites = useMemo(() => {
    const query = debouncedQuery.toLowerCase();

    return websiteData.filter((data) => {
      // Search filter
      if (query && !data.page?.name?.toLowerCase().includes(query)) {
        return false;
      }

      // Category filter
      if (selectedCategory && data.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === "all") return true;

      if (statusFilter === "operational") {
        return (
          data.status?.indicator === "none" ||
          data.status?.description?.toLowerCase().includes("operational")
        );
      }

      if (statusFilter === "issues") {
        return (
          data.status?.indicator !== "none" &&
          data.status?.indicator !== "undefined" &&
          !data.status?.description?.toLowerCase().includes("operational") &&
          data.status?.indicator !== "external" &&
          data.status?.indicator !== "error"
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
  }, [websiteData, debouncedQuery, selectedCategory, statusFilter]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    return {
      total: websiteData.length,
      operational: websiteData.filter(
        (d) =>
          d.status?.indicator === "none" ||
          d.status?.description?.toLowerCase().includes("operational")
      ).length,
      issues: websiteData.filter(
        (d) =>
          d.status?.indicator !== "none" &&
          d.status?.indicator !== "undefined" &&
          !d.status?.description?.toLowerCase().includes("operational") &&
          d.status?.indicator !== "external" &&
          d.status?.indicator !== "error"
      ).length,
      unknown: websiteData.filter((d) => d.status?.indicator === "error").length,
      external: websiteData.filter((d) => d.status?.indicator === "external").length,
    };
  }, [websiteData]);

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
              <RefreshButton onRefresh={handleRefresh} />
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

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar
                placeholders={[
                  "Search developer tools...",
                  "Find cloud services...",
                  "Look for AI platforms...",
                  "Search databases...",
                  "Find APIs...",
                ]}
                interval={3000}
                onChange={(e) => setSearchQuery(e.target.value || null)}
                onSubmit={(value) => setSearchQuery(value || null)}
                className="max-w-2xl w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center">
              <FilterSelector
                items={filterItems}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                theme="dark"
              />
            </div>
          </div>

          {/* Services Grid */}
          {loading || fetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: websiteData.length || 9 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ServiceCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredWebsites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebsites.map((website, index) => (
                <div
                  key={website.page.id}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ServiceCard website={website} loading={false} />
                </div>
              ))}
            </div>
          ) : (
            !loading && !fetching && <EmptyState {...getEmptyStateProps()} />
          )}

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-zinc-400 mb-2">
                  Built for developers • Data refreshes every 5 minutes • {websiteData.length} services monitored
                </p>
                <p className="text-xs text-zinc-500">
                  Open source project • Community-driven reports • Help us improve
                </p>
              </div>
              <div className="flex items-center gap-4">
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
                    <span>GitHub</span>
                  </a>
                </Button>
                <ContributeButton />
              </div>
            </div>
          </footer>
        </div>
        <ScrollToTop />
        <Toaster />
      </div>
    </>
  );
}
