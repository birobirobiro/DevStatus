"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertTriangle, XCircle, Info, HelpCircle, ExternalLink, Clock, Globe } from "lucide-react"
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
    return {
      icon: <HelpCircle className="w-4 h-4" />,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
      borderColor: "border-zinc-500/20",
      dotColor: "bg-zinc-500",
      label: "Unknown",
    }
  }

  const getStatusPageUrl = () => {
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

  // Função para determinar qual filtro aplicar baseado no status atual
  const getFilterTypeForStatus = () => {
    const desc = website.status.description?.toLowerCase()
    const indicator = website.status.indicator?.toLowerCase()

    // Operational
    if (desc === "all systems operational" || indicator === "none") {
      return "operational"
    }

    // Unknown/Error
    if (indicator === "unknown" || indicator === "error" || desc === "status check not implemented") {
      return "unknown"
    }

    // Issues (tudo que não é operational nem unknown)
    return "issues"
  }

  // Função para verificar se este card corresponde ao filtro atual
  const isMatchingCurrentFilter = () => {
    if (currentFilter === "all") return false

    const cardFilterType = getFilterTypeForStatus()
    return cardFilterType === currentFilter
  }

  const handleStatusClick = () => {
    const filterType = getFilterTypeForStatus()

    console.log("Card clicked:", {
      serviceName: website.page?.name || website.name,
      status: website.status,
      filterType,
      currentFilter,
    })

    // Se já está filtrando por este tipo, remove o filtro
    if (currentFilter === filterType) {
      onStatusFilter("all")
    } else {
      // Senão, aplica o filtro deste tipo
      onStatusFilter(filterType)
    }
  }

  const statusInfo = getStatusInfo()
  const ServiceIcon = getServiceIcon(website.page?.name || website.name)
  const isHighlighted = isMatchingCurrentFilter()

  // Verificar se é um serviço que não implementa status check
  const isStatusCheckNotImplemented =
    website.status.indicator === "unknown" ||
    website.status.description === "Status check not implemented" ||
    website.status.description === "Error fetching status"

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
        className={`h-[320px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/20 hover:-translate-y-1 group ${
          isHighlighted
            ? "bg-zinc-800/80 border-zinc-600 shadow-lg shadow-zinc-500/10"
            : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        }`}
      >
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
              <h3 className="font-semibold text-zinc-100 truncate text-lg">{website.page?.name || website.name}</h3>
              <Badge variant="secondary" className="text-xs mt-1 bg-zinc-800 text-zinc-300 border-zinc-700">
                {website.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
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

          {isStatusCheckNotImplemented ? (
            <div className="space-y-4">
              {/* Info Section - Compacta */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-3 h-3 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-300">External Status Page</span>
                </div>
                <p className="text-xs text-zinc-400">View real-time status on their official dashboard</p>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-full"
                >
                  <a
                    href={getStatusPageUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Status Page
                  </a>
                </Button>
              </div>
            </div>
          ) : (
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
                      <a href={getStatusPageUrl()} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View status page</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
