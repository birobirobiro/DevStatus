import type { ServiceReport, ServiceComment, ServiceIncident } from "@/types/reports";

const STORAGE_KEYS = {
  REPORTS: "devstatus_reports",
  COMMENTS: "devstatus_comments",
  INCIDENTS: "devstatus_incidents",
  USER_REPORTS: "devstatus_user_reports", // Track user's reports to prevent spam
} as const;

const REPORT_EXPIRY = 48 * 60 * 60 * 1000; // 48 hours
const SPAM_LIMIT = 10; // Max reports per user per hour
const SPAM_WINDOW = 60 * 60 * 1000; // 1 hour

export class ReportsStorage {
  // Check if user can report (anti-spam)
  static canUserReport(): boolean {
    if (typeof window === "undefined") return false;

    const userReports = this.getUserReports();
    const oneHourAgo = Date.now() - SPAM_WINDOW;
    const recentReports = userReports.filter((time) => time > oneHourAgo);

    return recentReports.length < SPAM_LIMIT;
  }

  // Track user report
  static trackUserReport(): void {
    if (typeof window === "undefined") return;

    const userReports = this.getUserReports();
    userReports.push(Date.now());

    // Keep only last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = userReports.filter((time) => time > oneDayAgo);

    localStorage.setItem(STORAGE_KEYS.USER_REPORTS, JSON.stringify(filtered));
  }

  private static getUserReports(): number[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Reports
  static getReports(): ServiceReport[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (!data) return [];

      const reports: ServiceReport[] = JSON.parse(data);
      const now = Date.now();

      // Filter out expired reports
      const validReports = reports.filter((report) => now - report.timestamp < REPORT_EXPIRY);

      // Update storage if we filtered anything
      if (validReports.length !== reports.length) {
        this.saveReports(validReports);
      }

      return validReports;
    } catch (error) {
      console.error("Error loading reports:", error);
      return [];
    }
  }

  static saveReports(reports: ServiceReport[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (error) {
      console.error("Error saving reports:", error);
    }
  }

  static addReport(report: Omit<ServiceReport, "id" | "timestamp">): ServiceReport | null {
    if (!this.canUserReport()) {
      return null;
    }

    const newReport: ServiceReport = {
      ...report,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const reports = this.getReports();
    reports.push(newReport);
    this.saveReports(reports);
    this.trackUserReport();

    return newReport;
  }

  static getReportsByService(serviceId: string): ServiceReport[] {
    return this.getReports().filter((report) => report.serviceId === serviceId);
  }

  // Comments
  static getComments(): ServiceComment[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (!data) return [];

      const comments: ServiceComment[] = JSON.parse(data);
      const now = Date.now();

      // Filter out expired comments
      const validComments = comments.filter((comment) => now - comment.timestamp < REPORT_EXPIRY);

      if (validComments.length !== comments.length) {
        this.saveComments(validComments);
      }

      return validComments;
    } catch (error) {
      console.error("Error loading comments:", error);
      return [];
    }
  }

  static saveComments(comments: ServiceComment[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (error) {
      console.error("Error saving comments:", error);
    }
  }

  static addComment(comment: Omit<ServiceComment, "id" | "timestamp" | "upvotes">): ServiceComment | null {
    if (!this.canUserReport()) {
      return null;
    }

    const newComment: ServiceComment = {
      ...comment,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      upvotes: 0,
    };

    const comments = this.getComments();
    comments.push(newComment);
    this.saveComments(comments);
    this.trackUserReport();

    return newComment;
  }

  static upvoteComment(commentId: string): void {
    const comments = this.getComments();
    const comment = comments.find((c) => c.id === commentId);

    if (comment) {
      comment.upvotes += 1;
      this.saveComments(comments);
    }
  }

  static getCommentsByService(serviceId: string): ServiceComment[] {
    return this.getComments()
      .filter((comment) => comment.serviceId === serviceId)
      .sort((a, b) => b.upvotes - a.upvotes || b.timestamp - a.timestamp);
  }

  // Incidents
  static getIncidents(): ServiceIncident[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading incidents:", error);
      return [];
    }
  }

  static saveIncidents(incidents: ServiceIncident[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (error) {
      console.error("Error saving incidents:", error);
    }
  }

  static getIncidentsByService(serviceId: string): ServiceIncident[] {
    return this.getIncidents()
      .filter((incident) => incident.serviceId === serviceId)
      .sort((a, b) => b.startTime - a.startTime);
  }

  // Stats
  static getReportStats(serviceId?: string): {
    total: number;
    lastHour: number;
    last24Hours: number;
    byType: Record<string, number>;
  } {
    const reports = serviceId ? this.getReportsByService(serviceId) : this.getReports();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const lastHour = reports.filter((r) => r.timestamp > oneHourAgo).length;
    const last24Hours = reports.filter((r) => r.timestamp > oneDayAgo).length;

    const byType: Record<string, number> = {};
    reports.forEach((report) => {
      byType[report.type] = (byType[report.type] || 0) + 1;
    });

    return {
      total: reports.length,
      lastHour,
      last24Hours,
      byType,
    };
  }

  static getReportTimeline(serviceId: string, hours = 24): Array<{ time: number; count: number }> {
    const reports = this.getReportsByService(serviceId);
    const now = Date.now();
    const startTime = now - hours * 60 * 60 * 1000;

    // Create hourly buckets
    const buckets: Array<{ time: number; count: number }> = [];
    for (let i = 0; i < hours; i++) {
      const time = startTime + i * 60 * 60 * 1000;
      buckets.push({ time, count: 0 });
    }

    // Count reports in each bucket
    reports.forEach((report) => {
      if (report.timestamp >= startTime) {
        const hourIndex = Math.floor((report.timestamp - startTime) / (60 * 60 * 1000));
        if (hourIndex >= 0 && hourIndex < hours) {
          buckets[hourIndex].count += 1;
        }
      }
    });

    return buckets;
  }

  // Get services with most reports (trending)
  static getTrendingServices(limit = 10): Array<{ serviceId: string; serviceName: string; count: number }> {
    const reports = this.getReports();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Count reports per service in last hour
    const serviceCounts = new Map<string, { name: string; count: number }>();

    reports
      .filter((r) => r.timestamp > oneHourAgo)
      .forEach((report) => {
        const current = serviceCounts.get(report.serviceId);
        if (current) {
          current.count += 1;
        } else {
          serviceCounts.set(report.serviceId, { name: report.serviceName, count: 1 });
        }
      });

    return Array.from(serviceCounts.entries())
      .map(([serviceId, { name, count }]) => ({
        serviceId,
        serviceName: name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Clear old data (maintenance)
  static clearOldData(): void {
    const reports = this.getReports();
    const comments = this.getComments();

    this.saveReports(reports); // Will auto-filter expired
    this.saveComments(comments); // Will auto-filter expired
  }
}

