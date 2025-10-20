"use client";

import { useEffect, useState } from "react";
import { ReportsStorage } from "@/lib/reports-storage";
import { TrendingUp } from "lucide-react";

interface MiniReportChartProps {
  serviceId: string;
}

export function MiniReportChart({ serviceId }: MiniReportChartProps) {
  const [data, setData] = useState<{ count: number; hasRecentReports: boolean }>({
    count: 0,
    hasRecentReports: false,
  });

  const loadData = () => {
    const stats = ReportsStorage.getReportStats(serviceId);
    setData({
      count: stats.lastHour,
      hasRecentReports: stats.lastHour > 0,
    });
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("reportsUpdated", handleUpdate);

    const interval = setInterval(loadData, 30000);

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [serviceId]);

  if (!data.hasRecentReports) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
        data.count > 5
          ? "bg-red-500/20 text-red-300 border border-red-500/30"
          : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
      }`}
    >
      <TrendingUp className="w-3 h-3" />
      <span>{data.count} report{data.count !== 1 ? "s" : ""}</span>
    </div>
  );
}

