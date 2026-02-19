"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle as AlertCircleIcon,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react";
import { getServiceIcon } from "@/services/service-icons";
import { useLogo } from "@/hooks/use-logo";
import type { WebsiteData } from "@/types";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuickReportDialog } from "@/components/quick-report-dialog";
import { ReportsStorage } from "@/lib/reports-storage";
import { FavoritesStorage } from "@/lib/favorites-storage";

// Provider display names for tooltips
const providerNames: Record<string, string> = {
  atlassian: "Atlassian Statuspage",
  google: "Google Workspace Status",
  microsoft: "Microsoft 365 Status",
  incidentio: "Incident.io",
  apple: "Apple System Status",
  hotmart: "Hotmart Status",
  appmax: "AppMax Status",
  postmark: "Postmark Status",
  openstatus: "OpenStatus",
  statusio: "Status.io",
  betterstack: "Better Stack",
  instatus: "Instatus",
  statuspal: "Statuspal",
  onlineornot: "OnlineOrNot",
  paypal: "PayPal Status",
  salesforce: "Salesforce Status",
  ohdear: "Oh Dear",
  pagerduty: "PagerDuty",
  xbox: "Xbox Live Status",
  playstation: "PlayStation Network Status",
  uptimekuma: "Uptime Kuma",
  tiktok: "TikTok Status",
  uptimerobot: "UptimeRobot",
  stripe: "Stripe Status",
  custom: "Custom Status Page",
};

function ProviderIcon({ type }: { type: string }) {
  const providerName = providerNames[type] || type;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-5 h-5 bg-zinc-800/60 border border-zinc-700/40 rounded flex items-center justify-center cursor-help">
            <Activity className="w-3 h-3 text-zinc-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-zinc-900 border-zinc-700">
          <p className="text-xs text-zinc-300">Status page powered by {providerName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ServiceCardProps {
  website: WebsiteData;
  loading: boolean;
}

export function ServiceCard({ website, loading }: ServiceCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const serviceName = website.name;
  const { data: logoResult } = useLogo(serviceName);
  const logoUrl = logoResult?.url ? (
    theme === 'dark' && logoResult.darkUrl ? logoResult.darkUrl :
    theme === 'light' && logoResult.lightUrl ? logoResult.lightUrl :
    logoResult.url
  ) : null;
  const [imgLoadError, setImgLoadError] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStats, setReportStats] = useState({ lastHour: 0, last24Hours: 0, timeline: [] as number[] });
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset image error state when logo URL changes
  useEffect(() => {
    if (logoUrl) {
      setImgLoadError(false);
    }
  }, [logoUrl]);

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

  const handleViewDetails = () => {
    const serviceSlug = website.name.toLowerCase().replace(/\s+/g, "-");
    // Navigate to service page without preserving search params
    router.push(`/service/${serviceSlug}`);
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
  const displayName = website.name;
  const ServiceIcon = getServiceIcon(displayName);
  const isExternalService = website.status.indicator === "external";
  const hasHighActivity = reportStats.lastHour > 10;

  if (loading) {
    return (
      <Card className="h-[380px] overflow-hidden bg-zinc-900/50 border-zinc-800 shimmer">
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
        className={`h-auto sm:h-[380px] overflow-hidden transition-all duration-300 hover:-translate-y-1 group relative backdrop-blur-sm bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-800/70 cursor-pointer ${
          statusInfo.glow ? statusInfo.glowClass : ""
        }`}
        onClick={handleViewDetails}
      >
        {/* Favorite Star */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 p-1.5 sm:p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 hover:bg-zinc-800 transition-all"
          type="button"
          aria-label="Toggle favorite"
        >
          <Star
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
              isFavorite ? "fill-yellow-400 text-yellow-400" : "text-zinc-400"
            }`}
          />
        </button>

        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-800 rounded-lg sm:rounded-xl border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors overflow-hidden">
                {logoUrl && !imgLoadError ? (
                  <img
                    src={logoUrl}
                    alt={`${displayName} logo`}
                    className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
                    onError={() => setImgLoadError(true)}
                    key={logoUrl}
                  />
                ) : (
                  <ServiceIcon className="w-5 h-5 sm:w-7 sm:h-7 text-zinc-300" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-zinc-900 ${statusInfo.dotColor}`} />
            </div>
            <div className="flex-1 min-w-0 pr-6 sm:pr-8">
              <h3 className="font-semibold text-zinc-100 truncate text-sm sm:text-base mb-0.5 sm:mb-1">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-1 items-center">
                <Badge variant="secondary" className="text-[10px] sm:text-xs bg-zinc-800 text-zinc-300 border-zinc-700 px-1.5 sm:px-2">
                  {website.category}
                </Badge>
                {website.statusPageType && website.statusPageType !== "custom" && (
                  <ProviderIcon type={website.statusPageType} />
                )}
                {hasHighActivity && (
                  <Badge className="text-[10px] sm:text-xs bg-orange-500/20 text-orange-300 border-orange-500/30 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2">
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    HIGH
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2 sm:space-y-3 p-3 sm:p-6">
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            <statusInfo.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusInfo.color}`} />
            <span className={`text-xs sm:text-sm font-medium ${statusInfo.color} flex-1 truncate`}>
              {website.status.description || statusInfo.label}
            </span>
          </div>

          {/* User Reports Section */}
          <div className="bg-zinc-800/30 rounded-lg p-2 sm:p-3 border border-zinc-800">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-wide">
                User Reports (24h)
              </span>
              {reportStats.last24Hours > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold text-orange-400">
                  {reportStats.last24Hours} total
                </span>
              )}
            </div>

            {/* Sparkline */}
            {reportStats.timeline.length > 0 && reportStats.last24Hours > 0 ? (
              <div className="flex items-end h-8 sm:h-12 gap-0.5 mb-1.5 sm:mb-2">
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
                      style={{ height: `${height}%`, minHeight: height > 0 ? "3px" : "2px" }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-8 sm:h-12 flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-xs text-zinc-500">No user reports yet</span>
              </div>
            )}

            {reportStats.lastHour > 0 && (
              <div className="text-[10px] sm:text-xs text-orange-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {reportStats.lastHour} in last hour
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  className="h-8 sm:h-9 px-2 sm:px-3 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center justify-center gap-1 sm:gap-2"
                >
                  <AlertCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-medium">Report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Report a problem</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStatusPage}
                  className="h-8 sm:h-9 px-2 sm:px-3 bg-zinc-700/30 border-zinc-600 hover:bg-zinc-700/50 text-zinc-300 hover:text-zinc-100 flex items-center justify-center gap-1 sm:gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs font-medium">Status</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open status page</TooltipContent>
            </Tooltip>
          </div>

          {/* Last Updated + Click hint */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 pt-1 sm:pt-1 border-t border-zinc-800">
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>
                {new Date(website.page.updated_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              Click for details →
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

