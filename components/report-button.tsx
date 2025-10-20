"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertCircle, Wifi, LogIn, Clock } from "lucide-react";
import { ReportsStorage } from "@/lib/reports-storage";
import { useToast } from "@/components/ui/use-toast";

interface ReportButtonProps {
  serviceId: string;
  serviceName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const REPORT_TYPES = [
  {
    type: "outage" as const,
    label: "Complete Outage",
    description: "Service is completely down",
    icon: AlertCircle,
    color: "text-red-500",
  },
  {
    type: "slow" as const,
    label: "Slow Performance",
    description: "Service is slow or degraded",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    type: "connection" as const,
    label: "Connection Issues",
    description: "Can't connect to service",
    icon: Wifi,
    color: "text-yellow-500",
  },
  {
    type: "login" as const,
    label: "Login Problems",
    description: "Can't sign in or authenticate",
    icon: LogIn,
    color: "text-blue-500",
  },
] as const;

export function ReportButton({ serviceId, serviceName, variant = "outline", size = "sm", className = "" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<(typeof REPORT_TYPES)[number]["type"] | null>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!selectedType) {
      toast({
        title: "Select a problem type",
        description: "Please select what kind of problem you're experiencing.",
        variant: "destructive",
      });
      return;
    }

    const canReport = ReportsStorage.canUserReport();
    if (!canReport) {
      toast({
        title: "Too many reports",
        description: "You've reached the maximum number of reports per hour. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const report = ReportsStorage.addReport({
      serviceId,
      serviceName,
      type: selectedType,
    });

    if (report) {
      toast({
        title: "Report submitted",
        description: `Thank you for reporting ${REPORT_TYPES.find((t) => t.type === selectedType)?.label} for ${serviceName}.`,
      });
      setOpen(false);
      setSelectedType(null);

      // Dispatch custom event to update other components
      window.dispatchEvent(new CustomEvent("reportsUpdated"));
    } else {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Report Problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Report a problem with {serviceName}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Let others know what kind of issue you're experiencing. Your report helps the community stay informed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label className="text-zinc-300 mb-2">What type of problem are you experiencing?</Label>
          <div className="grid gap-3">
            {REPORT_TYPES.map((reportType) => (
              <button
                key={reportType.type}
                onClick={() => setSelectedType(reportType.type)}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-all text-left ${
                  selectedType === reportType.type
                    ? "bg-zinc-800 border-zinc-600 ring-2 ring-zinc-500"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                }`}
                type="button"
              >
                <reportType.icon className={`w-5 h-5 mt-0.5 ${reportType.color}`} />
                <div className="flex-1">
                  <div className="font-medium text-zinc-100">{reportType.label}</div>
                  <div className="text-sm text-zinc-400 mt-0.5">{reportType.description}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    selectedType === reportType.type
                      ? "border-zinc-400 bg-zinc-400"
                      : "border-zinc-600"
                  }`}
                >
                  {selectedType === reportType.type && (
                    <div className="w-full h-full rounded-full bg-zinc-100" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedType} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100">
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

