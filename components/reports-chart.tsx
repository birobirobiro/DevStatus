"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsStorage } from "@/lib/reports-storage";
import { TrendingUp, Activity } from "lucide-react";

interface ReportsChartProps {
  serviceId: string;
  serviceName: string;
}

export function ReportsChart({ serviceId, serviceName }: ReportsChartProps) {
  const [timeline, setTimeline] = useState<Array<{ time: number; count: number }>>([]);
  const [stats, setStats] = useState({ lastHour: 0, last24Hours: 0 });

  const loadData = () => {
    const timelineData = ReportsStorage.getReportTimeline(serviceId, 24);
    const statsData = ReportsStorage.getReportStats(serviceId);

    setTimeline(timelineData);
    setStats({
      lastHour: statsData.lastHour,
      last24Hours: statsData.last24Hours,
    });
  };

  useEffect(() => {
    loadData();

    // Listen for reports updates
    const handleUpdate = () => loadData();
    window.addEventListener("reportsUpdated", handleUpdate);

    // Refresh every minute
    const interval = setInterval(loadData, 60000);

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [serviceId]);

  if (stats.last24Hours === 0) {
    return null;
  }

  const maxCount = Math.max(...timeline.map((t) => t.count), 1);
  const barWidth = 100 / timeline.length;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Reports
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-zinc-400">Last hour:</span>
              <span className="font-semibold text-orange-400">{stats.lastHour}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">24h:</span>
              <span className="font-semibold text-zinc-300">{stats.last24Hours}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-end h-32 gap-1">
            {timeline.map((bucket, index) => {
              const height = (bucket.count / maxCount) * 100;
              const isRecent = index >= timeline.length - 3;

              return (
                <div
                  key={bucket.time}
                  className="flex-1 relative group"
                  style={{ width: `${barWidth}%` }}
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      isRecent
                        ? bucket.count > 0
                          ? "bg-red-500"
                          : "bg-zinc-700/30"
                        : bucket.count > 0
                        ? "bg-orange-500/70"
                        : "bg-zinc-700/30"
                    }`}
                    style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "2px" }}
                  />
                  {bucket.count > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {bucket.count} report{bucket.count !== 1 ? "s" : ""}
                      <div className="text-[10px] text-zinc-500">
                        {new Date(bucket.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>24 hours ago</span>
            <span>Now</span>
          </div>
        </div>

        {stats.lastHour > 10 && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">High volume of reports in the last hour</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

