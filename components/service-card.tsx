"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  HelpCircle,
  Clock,
  Globe,
  ArrowUpRight,
  Rss,
  ExternalLink,
} from "lucide-react"
import { getServiceIcon } from "@/lib/service-icons"
import type { WebsiteData } from "@/types"
import { useEffect, useState } from "react"
import { LogoFetcher } from "@/lib/logo-fetcher"

interface ServiceCardProps {
  website: WebsiteData
  loading: boolean
  onStatusFilter: (status: string) => void
  currentFilter: string
}

export function ServiceCard({ website, loading, onStatusFilter, currentFilter }: ServiceCardProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isFetchingLogo, setIsFetchingLogo] = useState(false)

  useEffect(() => {
    setIsFetchingLogo(true)
    setLogoUrl(null)

    const serviceName = website.page?.name || website.name
    if (serviceName) {
      LogoFetcher.fetchLogo(serviceName)
        .then((result) => {
          if (result) {
            setLogoUrl(result.url)
          }
          setIsFetchingLogo(false)
        })
        .catch(() => {
          setIsFetchingLogo(false)
        })
    } else {
      setIsFetchingLogo(false)
    }
  }, [website.name, website.page?.name])

  const getStatusInfo = () => {
    const desc = website.status.description?.toLowerCase()
    const indicator = website.status.indicator?.toLowerCase()

    if (desc === "all systems operational" || indicator === "none") {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        dotColor: "bg-emerald-500",
        label: "Operational",
      }
    }
    if (desc?.includes("outage") || indicator === "major" || indicator === "critical") {
      return {
        icon: <XCircle className="w-4 h-4" />,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        dotColor: "bg-red-500",
        label: "Major Outage",
      }
    }
    if (desc?.includes("partial") || desc?.includes("degraded") || indicator === "minor") {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20",
        dotColor: "bg-orange-500",
        label: "Degraded",
      }
    }
    if (desc?.includes("maintenance") || indicator === "maintenance") {
      return {
        icon: <Info className="w-4 h-4" />,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        dotColor: "bg-blue-500",
        label: "Maintenance",
      }
    }
    if (indicator === "external" || desc === "external status page") {
      return {
        icon: <Globe className="w-4 h-4" />,
        color: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/20",
        dotColor: "bg-zinc-500",
        label: "External",
      }
    }
    return {
      icon: <HelpCircle className="w-4 h-4" />,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      dotColor: "bg-red-500",
      label: "Error",
    }
  }

  const getStatusPageUrl = () => {
    // Para serviços externos, use a URL direta da página
    if (website.status.indicator === "external" || website.status.description === "External status page") {
      return website.page?.url || website.url || "#"
    }

    if (!website.url) {
      return "#"
    }

    // Para URLs que contêm vusercontent.net, usar a URL da página original
    if (website.url.includes("vusercontent.net")) {
      return website.page?.url || "#"
    }

    // Remove API endpoints from URL to get the main status page
    return website.url.replace("/api/v2/summary.json", "").replace("/api/v2/status.json", "").replace("/api/v2/", "")
  }

  const getFilterTypeForStatus = () => {
    const desc = website.status.description?.toLowerCase()
    const indicator = website.status.indicator?.toLowerCase()

    // Operational
    if (desc === "all systems operational" || indicator === "none") {
      return "operational"
    }

    // Error (real errors only)
    if (indicator === "error") {
      return "unknown"
    }

    // External services don't participate in filtering
    if (indicator === "external") {
      return "external"
    }

    // Issues (everything else that's not operational, external, or error)
    return "issues"
  }

  const isMatchingCurrentFilter = () => {
    if (currentFilter === "all") return false

    const cardFilterType = getFilterTypeForStatus()

    // External services don't get highlighted by filters
    if (cardFilterType === "external") return false

    return cardFilterType === currentFilter
  }

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que o clique se propague para o card

    const filterType = getFilterTypeForStatus()

    // External services don't trigger filters
    if (filterType === "external") return

    // Se já está filtrando por este tipo, remove o filtro
    if (currentFilter === filterType) {
      onStatusFilter("all")
    } else {
      // Senão, aplica o filtro deste tipo
      onStatusFilter(filterType)
    }
  }

  const handleCardClick = () => {
    const statusPageUrl = getStatusPageUrl()
    console.log(`Redirecting to: ${statusPageUrl} for service: ${website.name}`)
    if (statusPageUrl && statusPageUrl !== "#") {
      window.open(statusPageUrl, "_blank", "noopener,noreferrer")
    }
  }

  const statusInfo = getStatusInfo()
  const ServiceIcon = getServiceIcon(website.page?.name || website.name)
  const isHighlighted = isMatchingCurrentFilter()

  // Verificar se é um serviço que não implementa status check
  const isExternalService =
    website.status.indicator === "external" || website.status.description === "External status page"

  // Determinar o tipo de monitoramento para o badge
  const getMonitoringType = () => {
    if (isExternalService) {
      return {
        label: "External Page",
        icon: <ExternalLink className="w-3 h-3" />,
        color: "bg-zinc-700 text-zinc-300 border-zinc-600",
        tooltip: "Status is monitored via external status page",
      }
    } else if (website.url.includes("api/v2/status.json")) {
      return {
        label: "Status API",
        icon: <Rss className="w-3 h-3" />,
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        tooltip: "Status is monitored via direct API integration",
      }
    } else if (website.url.includes("api/v2/summary.json")) {
      return {
        label: "Summary API",
        icon: <Rss className="w-3 h-3" />,
        color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        tooltip: "Status is monitored via summary API integration",
      }
    } else {
      return {
        label: "Custom",
        icon: <HelpCircle className="w-3 h-3" />,
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        tooltip: "Status is monitored via custom integration",
      }
    }
  }

  const monitoringType = getMonitoringType()

  if (loading) {
    return (
      <Card className="h-[320px] overflow-hidden bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl bg-zinc-800" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2 bg-zinc-800" />
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full mb-4 bg-zinc-800" />
          <Skeleton className="h-24 w-full bg-zinc-800" />
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card
        className={`h-[320px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/20 hover:-translate-y-1 group cursor-pointer relative ${
          isHighlighted
            ? "bg-zinc-800/80 border-zinc-600 shadow-lg shadow-zinc-500/10"
            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        }`}
        onClick={handleCardClick}
      >
        {/* Indicador de link externo no canto superior direito */}
        <div className="absolute top-2 right-2 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4" />
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center group-hover:border-zinc-600 transition-colors overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl || "/placeholder.svg"}
                    alt={`${website.page?.name || website.name} logo`}
                    className="w-8 h-8 object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                    onError={() => setLogoUrl(null)}
                  />
                ) : (
                  <ServiceIcon className="w-6 h-6 text-zinc-300" />
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 ${statusInfo.dotColor}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-semibold text-zinc-100 truncate text-lg">{website.page?.name || website.name}</h3>

                {/* Badge de tipo de monitoramento - Corrigido para não quebrar com títulos grandes */}
                <div className="flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 px-1.5 h-5 ${monitoringType.color} flex items-center gap-1`}
                      >
                        {monitoringType.icon}
                        <span className="hidden sm:inline">{monitoringType.label}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{monitoringType.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs mt-1 bg-zinc-800 text-zinc-300 border-zinc-700">
                {website.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isExternalService ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                    onClick={(e) => e.stopPropagation()}
                    type="button"
                  >
                    <div className={statusInfo.color}>{statusInfo.icon}</div>
                    <span className={`text-sm font-medium ${statusInfo.color} text-left`}>External Status Page</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This service provides an external status page</p>
                </TooltipContent>
              </Tooltip>

              <div className="space-y-4">
                {/* Informações adicionais para serviços externos */}
                <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-800">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">About this service</h4>
                  <p className="text-xs text-zinc-400 mb-2">
                    {website.name} provides a dedicated status page that shows real-time information about their service
                    health.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>Updated in real-time on their status page</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 text-center">
                  Click anywhere on this card to visit the status page
                </div>
              </div>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-4 cursor-pointer hover:opacity-80 transition-all duration-200 ${
                      isHighlighted
                        ? `${statusInfo.bgColor} ${statusInfo.borderColor} shadow-md`
                        : `${statusInfo.bgColor} ${statusInfo.borderColor}`
                    }`}
                    onClick={handleStatusClick}
                    type="button"
                  >
                    <div className={statusInfo.color}>{statusInfo.icon}</div>
                    <span className={`text-sm font-medium ${statusInfo.color} text-left`}>
                      {website.status.description || statusInfo.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to filter by {statusInfo.label.toLowerCase()} status</p>
                </TooltipContent>
              </Tooltip>

              <div>
                {website.components && website.components.length > 0 ? (
                  <ScrollArea className="h-20 mb-4">
                    <div className="space-y-2">
                      {website.components.slice(0, 3).map((component) => (
                        <div key={component.id} className="flex items-center gap-3 text-xs">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              component.status === "operational"
                                ? "bg-emerald-500"
                                : component.status.includes("outage")
                                  ? "bg-red-500"
                                  : component.status.includes("degraded")
                                    ? "bg-orange-500"
                                    : "bg-zinc-500"
                            }`}
                          />
                          <span className="truncate flex-1 text-zinc-300">{component.name}</span>
                        </div>
                      ))}
                      {website.components.length > 3 && (
                        <p className="text-xs text-zinc-500 pl-5">+{website.components.length - 3} more components</p>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-xs text-zinc-500 mb-4">No component details available</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(website.page.updated_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">Click to view status page</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
