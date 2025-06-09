"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceCard } from "@/components/service-card"
import { StatsOverview } from "@/components/stats-overview"
import { websites } from "@/data/sites"
import { Search, Zap, Filter, Github, Share2 } from "lucide-react"
import type { WebsiteData } from "@/types"
import { ContributeButton } from "@/components/contribute-button"
import { RefreshButton } from "@/components/refresh-button"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/toaster"
import Head from "next/head"
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const [websiteData, setWebsiteData] = useState<WebsiteData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { toast } = useToast()

  const categories = Array.from(new Set(websites.map((site) => site.category))).sort()

  const fetchData = async () => {
    try {
      setLoading(true)
      const dataPromises = websites.map(async (website) => {
        // Check if this is a service with external status page only
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
          (!website.url.includes("api/v2/summary.json") && !website.url.includes("api/v2/status.json"))

        if (isExternalOnlyService) {
          return {
            page: {
              id: website.name,
              name: website.name,
              url: website.url, // Usar a URL direta para serviços externos
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
          } as WebsiteData
        }

        try {
          const fetchedData = await getStatus(website.url)
          return {
            ...fetchedData,
            name: website.name,
            category: website.category,
            statusPageType: website.statusPageType,
            url: website.url,
          } as WebsiteData
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
          } as WebsiteData
        }
      })

      const resolvedData = await Promise.all(dataPromises)
      const sortedData = resolvedData.sort((a, b) => a.page.name.localeCompare(b.page.name))
      setWebsiteData(sortedData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatus = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Network response was not ok.")
    }
    return await response.json()
  }

  const handleStatusFilter = (status: string) => {
    console.log("Filter changed from", statusFilter, "to", status)
    setStatusFilter(status)
  }

  const handleShare = async () => {
    try {
      // Check if Web Share API is available and supported
      if (navigator.share && typeof navigator.canShare === "function") {
        const shareData = {
          title: "DevStatus - Developer Tools Status",
          text: "Check the current status of developer tools and services",
          url: window.location.href,
        }

        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "The page URL has been copied to your clipboard.",
      })
    } catch (error) {
      // Final fallback - try clipboard again or show manual copy
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "The page URL has been copied to your clipboard.",
        })
      } catch (clipboardError) {
        // Show the URL for manual copying
        const url = window.location.href
        toast({
          title: "Share this page",
          description: `Copy this URL: ${url}`,
          duration: 10000,
        })
      }
    }
  }

  const filteredWebsites = websiteData
    .filter((data) => data.page.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((data) => (selectedCategory ? data.category === selectedCategory : true))
    .filter((data) => {
      if (statusFilter === "all") return true
      if (statusFilter === "operational") {
        return data.status.indicator === "none" || data.status.description.toLowerCase().includes("operational")
      }
      if (statusFilter === "issues") {
        return (
          data.status.indicator !== "none" &&
          !data.status.description.toLowerCase().includes("operational") &&
          data.status.indicator !== "external" &&
          data.status.indicator !== "error"
        )
      }
      if (statusFilter === "unknown") {
        return data.status.indicator === "error" // Only real errors, not external services
      }
      return true
    })

  // Count services by status type
  const stats = {
    total: websiteData.length,
    operational: websiteData.filter(
      (d) => d.status.indicator === "none" || d.status.description.toLowerCase().includes("operational"),
    ).length,
    issues: websiteData.filter(
      (d) =>
        d.status.indicator !== "none" &&
        !d.status.description.toLowerCase().includes("operational") &&
        d.status.indicator !== "external" &&
        d.status.indicator !== "error",
    ).length,
    unknown: websiteData.filter((d) => d.status.indicator === "error").length, // Only real errors
    external: websiteData.filter((d) => d.status.indicator === "external").length, // External services count
  }

  const getFilterDisplayText = () => {
    if (statusFilter === "all") return "All Services"
    if (statusFilter === "operational") return `Operational Services (${stats.operational})`
    if (statusFilter === "issues") return `Services with Issues (${stats.issues})`
    if (statusFilter === "unknown") return `Fetch Errors (${stats.unknown})`
    return "All Services"
  }

  console.log("Current filter:", statusFilter, "Filtered websites count:", filteredWebsites.length)

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
              description: "Real-time status monitoring for developer tools and services",
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
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                  <Zap className="w-8 h-8 text-zinc-100" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-zinc-100 mb-4">DevStatus</h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Real-time monitoring for developer tools and services. Stay informed about outages and maintenance.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <RefreshButton onRefresh={fetchData} />
              <ContributeButton />
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-zinc-300">{stats.operational} Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-zinc-300">{stats.issues} Issues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                <span className="text-zinc-300">{stats.external} External</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-zinc-300">{stats.unknown} Errors</span>
              </div>
            </div>

            {/* Last Updated */}
            <p className="text-xs text-zinc-500 mt-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>

          {/* Stats Overview */}
          <StatsOverview
            stats={stats}
            loading={loading}
            onStatusFilter={handleStatusFilter}
            currentFilter={statusFilter}
          />

          {/* Search and Filters */}
          <Card className="mb-8 bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search developer tools and services..."
                  className="pl-12 h-14 text-lg bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Filter Display */}
          {statusFilter !== "all" && (
            <div className="mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-300">Filtering by:</span>
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-400 cursor-pointer hover:bg-blue-500/20"
                  onClick={() => setStatusFilter("all")}
                >
                  {getFilterDisplayText()} ✕
                </Badge>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 ${
                  selectedCategory === null
                    ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 ${
                    selectedCategory === category
                      ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWebsites.map((website) => (
              <ServiceCard
                key={website.page.id}
                website={website}
                loading={loading}
                onStatusFilter={handleStatusFilter}
                currentFilter={statusFilter}
              />
            ))}
          </div>

          {/* No Results */}
          {filteredWebsites.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">No services found</h3>
              <p className="text-zinc-400">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-zinc-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-zinc-400 mb-2">
                  Built for developers • Data refreshes every 5 minutes • {websiteData.length} services monitored
                </p>
                <p className="text-xs text-zinc-500">
                  Open source project • Help us improve by suggesting new services
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
                  <a
                    href="https://github.com/birobirobiro-projects/v0-enhance-dev-status-tool"
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
        <Toaster />
      </div>
    </>
  )
}
