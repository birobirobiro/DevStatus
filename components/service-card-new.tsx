"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  AlertCircle as AlertCircleIcon,
  Star,
  TrendingUp,
} from "lucide-react";
import { getServiceIcon } from "@/services/service-icons";
import { LogoFetcher } from "@/services/logo-fetcher";
import type { WebsiteData } from "@/types";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuickReportDialog } from "@/components/quick-report-dialog";
import { ReportsStorage } from "@/lib/reports-storage";
import { FavoritesStorage } from "@/lib/favorites-storage";

interface ServiceCardProps {
  website: WebsiteData;
  loading: boolean;
}

export function ServiceCardNew({ website, loading }: ServiceCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStats, setReportStats] = useState({ lastHour: 0, last24Hours: 0, timeline: [] as number[] });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setLogoUrl(null);

    const serviceName = website.page?.name || website.name;

    if (serviceName) {
      LogoFetcher.fetchLogo(serviceName)
        .then((result) => {
          if (result) {
            setLogoUrl(result.url);
          }
        })
        .catch(() => {
          // Silent fail
        });
    }
  }, [website.name, website.page?.name]);

  useEffect(() => {
    const updateStats = () => {
      const stats = ReportsStorage.getReportStats(website.name);
      const timeline = ReportsStorage.getReportTimeline(website.name, 12);
      setReportStats({
        lastHour: stats.lastHour,
        last24Hours: stats.last24Hours,
        timeline: timeline.map(t => t.count),
      });
      setIsFavorite(FavoritesStorage.isFavorite(website.name));
    };

    updateStats();

    const handleUpdate = () => updateStats();
    window.addEventListener("reportsUpdated", handleUpdate);
    window.addEventListener("favoritesUpdated", handleUpdate);

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate);
      window.removeEventListener("favoritesUpdated", handleUpdate);
    };
  }, [website.name]);

  const getStatusInfo = () => {
    const desc = website.status.description?.toLowerCase();
    const indicator = website.status.indicator?.toLowerCase();

    if (desc === "all systems operational" || indicator === "none") {
      return {
        icon: CheckCircle,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        dotColor: "bg-emerald-500",
        label: "Operational",
        glow: false,
      };
    }
    if (desc?.includes("outage") || indicator === "major" || indicator === "critical") {
      return {
        icon: XCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        dotColor: "bg-red-500",
        label: "Major Outage",
        glow: true,
        glowClass: "animate-glow-danger",
      };
    }
    if (desc?.includes("partial") || desc?.includes("degraded") || indicator === "minor") {
      return {
        icon: AlertTriangle,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        dotColor: "bg-orange-500",
        label: "Degraded",
        glow: true,
        glowClass: "animate-glow-warning",
      };
    }
    return {
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      dotColor: "bg-emerald-500",
      label: "Operational",
      glow: false,
    };
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const serviceSlug = website.name.toLowerCase().replace(/\s+/g, "-");
    // Preserve query params when navigating to service page
    const params = new URLSearchParams(searchParams.toString());
    const queryString = params.toString();
    const serviceUrl = queryString 
      ? `/service/${serviceSlug}?${queryString}`
      : `/service/${serviceSlug}`;
    router.push(serviceUrl);
  };

  const handleStatusPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusPageUrl = website.page?.url || website.url;
    if (statusPageUrl && statusPageUrl !== "#") {
      window.open(statusPageUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReportDialogOpen(true);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    FavoritesStorage.toggleFavorite(website.name);
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  };

  const statusInfo = getStatusInfo();
  const displayName = website.page?.name || website.name;
  const ServiceIcon = getServiceIcon(displayName);
  const isExternalService = website.status.indicator === "external";
  const hasHighActivity = reportStats.lastHour > 10;

  if (loading) {
    return (
      <Card className="h-[420px] overflow-hidden bg-zinc-900/50 border-zinc-800 shimmer">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-xl bg-zinc-800" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full mb-4 bg-zinc-800" />
          <Skeleton className="h-32 w-full bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card
        className={`h-[420px] overflow-hidden transition-all duration-300 hover:-translate-y-1 group relative backdrop-blur-sm bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-800/70 ${
          statusInfo.glow ? statusInfo.glowClass : ""
        }`}
      >
        {/* Favorite Star */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 hover:bg-zinc-800 transition-all"
          type="button"
          aria-label="Toggle favorite"
        >
          <Star
            className={`w-4 h-4 transition-all ${
              isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"
            }`}
          />
        </button>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${displayName} logo`}
                    className="w-9 h-9 object-contain brightness-0 invert opacity-80"
                    onError={() => setLogoUrl(null)}
                  />
                ) : (
                  <ServiceIcon className="w-7 h-7 text-zinc-300" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${statusInfo.dotColor}`} />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-semibold text-zinc-100 truncate text-base mb-1">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                  {website.category}
                </Badge>
                {hasHighActivity && (
                  <Badge className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/30 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    HIGH ACTIVITY
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-sm font-medium ${statusInfo.color} flex-1`}>
              {website.status.description || statusInfo.label}
            </span>
          </div>

          {/* User Reports Section */}
          {!isExternalService && (
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  User Reports (24h)
                </span>
                {reportStats.last24Hours > 0 && (
                  <span className="text-xs font-semibold text-orange-400">
                    {reportStats.last24Hours} total
                  </span>
                )}
              </div>

              {/* Sparkline */}
              {reportStats.timeline.length > 0 && reportStats.last24Hours > 0 ? (
                <div className="flex items-end h-8 gap-0.5 mb-2">
                  {reportStats.timeline.map((count, i) => {
                    const maxCount = Math.max(...reportStats.timeline, 1);
                    const height = (count / maxCount) * 100;
                    const isRecent = i >= reportStats.timeline.length - 3;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          isRecent
                            ? count > 0
                              ? "bg-red-500"
                              : "bg-zinc-700/30"
                            : count > 0
                            ? "bg-orange-500/70"
                            : "bg-zinc-700/30"
                        }`}
                        style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "2px" }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="h-8 flex items-center justify-center mb-2">
                  <span className="text-xs text-zinc-500">No reports</span>
                </div>
              )}

              {reportStats.lastHour > 0 && (
                <div className="text-xs text-orange-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {reportStats.lastHour} in last hour
                </div>
              )}
            </div>
          )}

          {/* Components */}
          {!isExternalService && website.components && website.components.length > 0 ? (
            <ScrollArea className="h-16">
              <div className="space-y-1">
                {website.components.slice(0, 3).map((component) => (
                  <div
                    key={component.id}
                    className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-zinc-900/40"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        component.status === "operational"
                          ? "bg-emerald-500"
                          : component.status.includes("outage")
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    />
                    <span className="truncate text-zinc-300">{component.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-16 flex items-center justify-center text-xs text-zinc-500">
              {isExternalService ? "External status page" : "No components"}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  className="h-9 px-2 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                >
                  <AlertCircleIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Report Problem</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                  className="h-9 px-2 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStatusPage}
                  className="h-9 px-2 bg-zinc-700/30 border-zinc-600 hover:bg-zinc-700/50 text-zinc-300 hover:text-zinc-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Status Page</TooltipContent>
            </Tooltip>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1 border-t border-zinc-800">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(website.page.updated_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </CardContent>

        <QuickReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          serviceId={website.name}
          serviceName={website.name}
        />
      </Card>
    </TooltipProvider>
  );
}

