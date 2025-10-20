export interface ServiceReport {
  id: string;
  serviceId: string;
  serviceName: string;
  type: "outage" | "slow" | "connection" | "login";
  timestamp: number;
  userAgent?: string;
  location?: string;
}

export interface ServiceComment {
  id: string;
  serviceId: string;
  serviceName: string;
  comment: string;
  timestamp: number;
  userName?: string;
  upvotes: number;
  type: "problem" | "resolved" | "info";
}

export interface ReportStats {
  total: number;
  lastHour: number;
  last24Hours: number;
  byType: Record<string, number>;
  timeline: Array<{ time: number; count: number }>;
}

export interface ServiceIncident {
  id: string;
  serviceId: string;
  serviceName: string;
  startTime: number;
  endTime?: number;
  severity: "minor" | "major" | "critical";
  description: string;
  reportsCount: number;
}

