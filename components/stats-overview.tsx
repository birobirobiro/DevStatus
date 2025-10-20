"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertTriangle, Activity, TrendingUp, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { ReportsStorage } from "@/lib/reports-storage"
import { FavoritesStorage } from "@/lib/favorites-storage"

interface StatsOverviewProps {
  stats: {
    total: number
    operational: number
    issues: number
    unknown: number
    external: number
  }
  loading: boolean
  onStatusFilter: (status: string) => void
  currentFilter: string
}

export function StatsOverview({ stats, loading, onStatusFilter, currentFilter }: StatsOverviewProps) {
  const [trendingCount, setTrendingCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)

  useEffect(() => {
    const updateCounts = () => {
      const trending = ReportsStorage.getTrendingServices(100)
      setTrendingCount(trending.length)
      setFavoritesCount(FavoritesStorage.getFavorites().length)
    }

    updateCounts()

    const handleUpdate = () => updateCounts()
    window.addEventListener("reportsUpdated", handleUpdate)
    window.addEventListener("favoritesUpdated", handleUpdate)

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate)
      window.removeEventListener("favoritesUpdated", handleUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 mb-4 bg-zinc-800" />
              <Skeleton className="h-8 w-16 mb-2 bg-zinc-800" />
              <Skeleton className="h-4 w-24 bg-zinc-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const operationalPercentage = stats.total > 0 ? Math.round((stats.operational / stats.total) * 100) : 0

  const handleCardClick = (filterType: string) => {
    if (currentFilter === filterType) {
      onStatusFilter("all")
    } else {
      onStatusFilter(filterType)
    }
  }

  const statCards = [
    {
      title: "Total Services",
      value: stats.total,
      icon: Activity,
      color: "text-zinc-400",
      bgColor: "bg-zinc-700/20",
      borderColor: "border-zinc-700/50",
      filterType: "all",
      activeColor: "text-zinc-200",
      activeBgColor: "bg-zinc-700/40",
    },
    {
      title: `Operational (${operationalPercentage}%)`,
      value: stats.operational,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      filterType: "operational",
      activeColor: "text-emerald-300",
      activeBgColor: "bg-emerald-500/20",
    },
    {
      title: "With Issues",
      value: stats.issues,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      filterType: "issues",
      activeColor: "text-red-300",
      activeBgColor: "bg-red-500/20",
    },
    {
      title: "Trending",
      value: trendingCount,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      filterType: "trending",
      activeColor: "text-orange-300",
      activeBgColor: "bg-orange-500/20",
    },
    {
      title: "Favorites",
      value: favoritesCount,
      icon: Heart,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      filterType: "favorites",
      activeColor: "text-pink-300",
      activeBgColor: "bg-pink-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
      {statCards.map((stat, index) => {
        const isActive = currentFilter === stat.filterType
        return (
          <Card
            key={index}
            className={`transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-zinc-900/20 hover:-translate-y-1 ${stat.borderColor} border-l-4 animate-scale-in ${
              isActive
                ? `bg-zinc-800/80 border-zinc-600 shadow-lg ${stat.activeBgColor.includes("emerald") ? "shadow-emerald-500/10" : stat.activeBgColor.includes("red") ? "shadow-red-500/10" : stat.activeBgColor.includes("orange") ? "shadow-orange-500/10" : stat.activeBgColor.includes("pink") ? "shadow-pink-500/10" : "shadow-zinc-500/10"}`
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
            }`}
            onClick={() => handleCardClick(stat.filterType)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isActive ? stat.activeBgColor : stat.bgColor
                  }`}
                >
                  <stat.icon className={`w-5 h-5 ${isActive ? stat.activeColor : stat.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isActive ? stat.activeColor : stat.color} animate-count-up`}>{stat.value}</p>
                  <p className={`text-xs mt-1 ${isActive ? "text-zinc-300" : "text-zinc-400"}`}>{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
