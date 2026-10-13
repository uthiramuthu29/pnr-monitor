"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackedPnr, PnrData } from "@/types/pnr";

export interface MongoJourneyDoc {
  _id?: string;
  pnrNumber: string;
  trainNumber?: string;
  trainName?: string;
  dateOfJourney?: string;
  sourceStation?: string;
  destinationStation?: string;
  journeyClass?: string;
  chartStatus?: string;
  scheduleType?: "once_daily" | "twice_daily" | "weekly";
  notificationTimes?: string[];
  weeklyDays?: { day: string; time: string }[];
  passengers?: Array<{
    passengerSerialNumber: number;
    bookingStatus: string;
    bookingStatusDetails: string;
    currentStatus: string;
    currentStatusDetails: string;
    bookingCoachId?: string;
    bookingBerthNo?: number;
    currentCoachId?: string;
    currentBerthNo?: number;
  }>;
  recipients?: Array<{
    name: string;
    channel?: "email" | "telegram";
    email?: string;
    telegramChatId?: string;
    phone?: string;
  }>;
  lastCheckedAt?: string | Date;
  lastStatusSummary?: string;
  lastNotifiedAt?: string | Date;
  lastEmailSentAt?: string | Date;
  lastTelegramSentAt?: string | Date;
  lastSmsSentAt?: string | Date;
  rawPnrData?: PnrData;
  isActive?: boolean;
  createdAt?: string | Date;
}

function formatTime12(t: string): string {
  if (!t || !t.includes(":")) return t || "09:00 AM";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

function formatFrequency(
  scheduleType?: string,
  notificationTimes: string[] = [],
  weeklyDays: { day: string; time: string }[] = [],
): string {
  if (scheduleType === "weekly" && weeklyDays?.length) {
    const list = weeklyDays.map(
      (w) => `${w.day.slice(0, 3)} @ ${formatTime12(w.time)}`,
    );
    return `Weekly (${list.join(", ")})`;
  }
  if (scheduleType === "twice_daily" && notificationTimes?.length) {
    return `Twice daily at ${notificationTimes.map(formatTime12).join(" & ")}`;
  }
  if (notificationTimes?.length) {
    return `Daily at ${formatTime12(notificationTimes[0])}`;
  }
  return "Daily at 09:00 AM";
}

function formatRelativeTime(d: string | Date | undefined): string {
  if (!d) return "Not yet";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "Not yet";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function mapDocToTrackedPnr(doc: MongoJourneyDoc): TrackedPnr {
  const data: PnrData =
    doc.rawPnrData && doc.rawPnrData.pnrNumber
      ? doc.rawPnrData
      : {
          pnrNumber: doc.pnrNumber,
          dateOfJourney: doc.dateOfJourney || "",
          trainNumber: doc.trainNumber || "—",
          trainName: doc.trainName || "Express Train",
          sourceStation: doc.sourceStation || "SRC",
          destinationStation: doc.destinationStation || "DST",
          reservationUpto: doc.destinationStation || "DST",
          boardingPoint: doc.sourceStation || "SRC",
          journeyClass: doc.journeyClass || "SL",
          numberOfpassenger: doc.passengers?.length || 1,
          chartStatus: doc.chartStatus || "Chart Not Prepared",
          informationMessage: [],
          passengerList: (doc.passengers || []).map((p) => ({
            passengerSerialNumber: p.passengerSerialNumber || 1,
            bookingStatus: p.bookingStatus || "",
            bookingStatusDetails: p.bookingStatusDetails || "",
            currentStatus: p.currentStatus || "",
            currentStatusDetails: p.currentStatusDetails || "",
            bookingCoachId: p.bookingCoachId || "",
            bookingBerthNo: p.bookingBerthNo || 0,
            currentCoachId: p.currentCoachId || "",
            currentBerthNo: p.currentBerthNo || 0,
          })),
          timeStamp: doc.lastCheckedAt
            ? new Date(doc.lastCheckedAt).toISOString()
            : new Date().toISOString(),
          bookingFare: 0,
          ticketFare: 0,
          quota: "GN",
          arrivalDate: "",
          distance: 0,
          isWL: "N",
        };

  return {
    pnrNumber: doc.pnrNumber,
    frequency: formatFrequency(
      doc.scheduleType,
      doc.notificationTimes,
      doc.weeklyDays,
    ),
    scheduleType: doc.scheduleType,
    notificationTimes: doc.notificationTimes,
    weeklyDays: doc.weeklyDays,
    recipients: doc.recipients || [],
    lastChecked: formatRelativeTime(doc.lastCheckedAt),
    lastNotifiedAt: doc.lastNotifiedAt
      ? formatRelativeTime(doc.lastNotifiedAt)
      : doc.lastEmailSentAt
        ? formatRelativeTime(doc.lastEmailSentAt)
        : doc.lastTelegramSentAt
          ? formatRelativeTime(doc.lastTelegramSentAt)
          : doc.lastSmsSentAt
            ? formatRelativeTime(doc.lastSmsSentAt)
            : undefined,
    lastEmailSentAt: doc.lastEmailSentAt
      ? formatRelativeTime(doc.lastEmailSentAt)
      : undefined,
    lastTelegramSentAt: doc.lastTelegramSentAt
      ? formatRelativeTime(doc.lastTelegramSentAt)
      : undefined,
    lastSmsSentAt: doc.lastSmsSentAt
      ? formatRelativeTime(doc.lastSmsSentAt)
      : undefined,
    lastStatusSummary: doc.lastStatusSummary,
    data,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

export function useTrackedPnrs() {
  const [trackedPnrs, setTrackedPnrs] = useState<TrackedPnr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPnrs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pnrs");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapDocToTrackedPnr);
        setTrackedPnrs(mapped);
      } else {
        setTrackedPnrs([]);
      }
    } catch (err) {
      console.error("Failed to fetch monitored journeys from MongoDB:", err);
      setError(err instanceof Error ? err.message : "Failed to load journeys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/pnrs")
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          if (json.success && Array.isArray(json.data)) {
            setTrackedPnrs(json.data.map(mapDocToTrackedPnr));
          } else {
            setTrackedPnrs([]);
          }
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to fetch monitored journeys from MongoDB:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load journeys",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const removeTrackedPnr = async (pnrNumber: string) => {
    // Optimistic UI update
    setTrackedPnrs((prev) => prev.filter((p) => p.pnrNumber !== pnrNumber));

    try {
      const res = await fetch(`/api/pnrs/${pnrNumber}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        console.warn("Delete journey returned error:", json.error);
        // Refresh to restore accurate database state if failed
        fetchPnrs();
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to delete journey:", err);
      fetchPnrs();
      return false;
    }
  };

  const addTrackedPnr = (newJourney?: unknown) => {
    // If the backend returned the journey doc, map and prepend it immediately
    if (newJourney && typeof newJourney === "object" && "pnrNumber" in newJourney) {
      const mapped = mapDocToTrackedPnr(newJourney as MongoJourneyDoc);
      setTrackedPnrs((prev) => [
        mapped,
        ...prev.filter((p) => p.pnrNumber !== mapped.pnrNumber),
      ]);
    }
    fetchPnrs();
  };

  const triggerCheck = async (pnrNumber: string) => {
    try {
      const res = await fetch(
        `/api/cron/check-scheduled?pnr=${pnrNumber}&force=true`,
      );
      const json = await res.json();
      await fetchPnrs();
      return json;
    } catch (err) {
      console.error("Trigger check error:", err);
      return { success: false, error: "Network error triggering check" };
    }
  };

  return {
    trackedPnrs,
    loading,
    error,
    refresh: fetchPnrs,
    removeTrackedPnr,
    addTrackedPnr,
    triggerCheck,
  };
}
