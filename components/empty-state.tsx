"use client";

import { EmptyPage } from "@/components/ui/empty";
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
    <EmptyPage 
      className="border-zinc-800"
      icon={Icon}
      title={title}
      description={description}
      action={actionLabel && onAction ? {
        label: actionLabel,
        onClick: onAction,
        variant: "outline" as const,
      } : undefined}
    />
  );
}

