"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AlertCircle, Wifi, LogIn, Clock, Check } from "lucide-react";
import { ReportsStorage } from "@/lib/reports-storage";
import { useToast } from "@/components/ui/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";

interface QuickReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
}

const REPORT_TYPES = [
  {
    type: "outage" as const,
    label: "Complete Outage",
    description: "Service is completely down",
    icon: AlertCircle,
    color: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400",
  },
  {
    type: "slow" as const,
    label: "Slow Performance",
    description: "Service is slow or degraded",
    icon: Clock,
    color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 hover:border-orange-500/50 text-orange-400",
  },
  {
    type: "connection" as const,
    label: "Connection Issues",
    description: "Can't connect to service",
    icon: Wifi,
    color: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400",
  },
  {
    type: "login" as const,
    label: "Login Problems",
    description: "Can't sign in or authenticate",
    icon: LogIn,
    color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400",
  },
] as const;

export function QuickReportDialog({
  open,
  onOpenChange,
  serviceId,
  serviceName,
}: QuickReportDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleReport = async (type: (typeof REPORT_TYPES)[number]["type"]) => {
    setSubmitting(true);

    const canReport = ReportsStorage.canUserReport();
    if (!canReport) {
      toast({
        title: "Too many reports",
        description: "You've reached the maximum number of reports per hour.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const report = ReportsStorage.addReport({
      serviceId,
      serviceName,
      type,
    });

    if (report) {
      const reportTypeLabel = REPORT_TYPES.find((t) => t.type === type)?.label;
      toast({
        title: "Report submitted",
        description: `Thank you for reporting ${reportTypeLabel} for ${serviceName}.`,
      });
      onOpenChange(false);
      window.dispatchEvent(new CustomEvent("reportsUpdated"));
    } else {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    }

    setSubmitting(false);
  };

  const content = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
      {REPORT_TYPES.map((reportType) => (
        <button
          key={reportType.type}
          onClick={() => handleReport(reportType.type)}
          disabled={submitting}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed ${reportType.color}`}
          type="button"
        >
          <reportType.icon className="w-8 h-8" />
          <div>
            <div className="font-semibold text-sm mb-1">{reportType.label}</div>
            <div className="text-xs opacity-80">{reportType.description}</div>
          </div>
          {submitting && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        </button>
      ))}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Report a problem with {serviceName}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Select the type of issue you're experiencing. Your report helps the community stay informed.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-zinc-900 border-zinc-800">
        <DrawerHeader>
          <DrawerTitle className="text-zinc-100">Report a problem</DrawerTitle>
          <DrawerDescription className="text-zinc-400">
            {serviceName} - Select the issue type
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}

