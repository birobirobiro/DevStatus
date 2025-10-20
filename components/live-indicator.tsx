"use client";

import { useEffect, useState } from "react";

interface LiveIndicatorProps {
  lastUpdated: Date;
}

export function LiveIndicator({ lastUpdated }: LiveIndicatorProps) {
  const [timeSince, setTimeSince] = useState("");

  useEffect(() => {
    const updateTimeSince = () => {
      const now = Date.now();
      const diff = now - lastUpdated.getTime();
      const seconds = Math.floor(diff / 1000);

      if (seconds < 10) {
        setTimeSince("just now");
      } else if (seconds < 60) {
        setTimeSince(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeSince(`${minutes}m ago`);
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-live" />
        <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75" />
      </div>
      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
        LIVE
      </span>
      <span className="text-xs text-zinc-500">•</span>
      <span className="text-xs text-zinc-400">{timeSince}</span>
    </div>
  );
}

