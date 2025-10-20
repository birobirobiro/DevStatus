"use client";

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showConfetti?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  showConfetti = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`relative mb-6 ${showConfetti ? "animate-bounce-subtle" : ""}`}>
        <div className="w-24 h-24 bg-zinc-800/50 rounded-2xl border border-zinc-700 flex items-center justify-center">
          <Icon className="w-12 h-12 text-zinc-400" />
        </div>
        {showConfetti && (
          <div className="absolute -inset-4">
            <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute top-2 right-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
            <div className="absolute bottom-0 right-2 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

