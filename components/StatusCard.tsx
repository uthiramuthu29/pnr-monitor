"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  TramFront,
  MoveRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Trash2,
  AlertCircle,
  Armchair,
  Send,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import type { PnrData } from "@/types/pnr";

type StatusCardProps = {
  data: PnrData;
  recipients?: {
    name: string;
    channel?: "email" | "telegram";
    email?: string;
    telegramChatId?: string;
    phone?: string;
  }[];
  frequency?: string;
  lastChecked?: string;
  lastNotifiedAt?: string;
  lastEmailSentAt?: string;
  lastTelegramSentAt?: string;
  lastSmsSentAt?: string;
  onRemove?: () => void;
  onTriggerCheck?: () => Promise<unknown> | void;
};

export default function StatusCard({
  data,
  recipients,
  frequency,
  lastChecked,
  lastNotifiedAt,
  lastEmailSentAt,
  lastTelegramSentAt,
  lastSmsSentAt,
  onRemove,
  onTriggerCheck,
}: StatusCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);

  const handleTestTrigger = async () => {
    if (!onTriggerCheck) return;
    try {
      setIsChecking(true);
      setCheckFeedback(null);
      await onTriggerCheck();
      setCheckFeedback("Checked & Alerts Dispatched!");
      setTimeout(() => setCheckFeedback(null), 3500);
    } catch {
      setCheckFeedback("Check failed");
      setTimeout(() => setCheckFeedback(null), 3000);
    } finally {
      setIsChecking(false);
    }
  };

  const journeyDate = data?.dateOfJourney ? new Date(data.dateOfJourney) : null;

  const departDate = journeyDate && !isNaN(journeyDate.getTime())
    ? journeyDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : data?.dateOfJourney || "N/A";

  const departTime = journeyDate && !isNaN(journeyDate.getTime())
    ? journeyDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const handleCopy = () => {
    if (data?.pnrNumber) {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.pnrNumber).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          fallbackCopy();
        });
      } else {
        fallbackCopy();
      }
    }
  };

  const fallbackCopy = () => {
    try {
      const el = document.createElement("textarea");
      el.value = data.pnrNumber;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("CNF") || s.includes("CONFIRM")) {
      return {
        bg: "bg-[#ECFDF5]",
        text: "text-green-800",
        dot: "bg-green-600",
        border: "border-green-200",
      };
    }
    if (s.includes("RAC")) {
      return {
        bg: "bg-[#FFFBEB]",
        text: "text-amber-800",
        dot: "bg-amber-500",
        border: "border-amber-200",
      };
    }
    if (s.includes("WL") || s.includes("WAIT")) {
      return {
        bg: "bg-[#FEF2F2]",
        text: "text-red-800",
        dot: "bg-red-500",
        border: "border-red-200",
      };
    }
    return {
      bg: "bg-[#F1F5F9]",
      text: "text-slate-800",
      dot: "bg-slate-500",
      border: "border-slate-200",
    };
  };

  const primaryStatus =
    data?.passengerList?.[0]?.currentStatus ||
    data?.passengerList?.[0]?.bookingStatus ||
    (data?.isWL === "Y" ? "WL" : "CNF");

  const primaryStyle = getStatusStyle(primaryStatus);

  const displayRecipients =
    recipients && recipients.length > 0
      ? recipients
          .map(
            (r) =>
              `${r.name} (${r.channel === "telegram" ? "Telegram" : "Gmail"})`,
          )
          .join(", ")
      : "Alert contacts";

  return (
    <div className="p-5 bg-white rounded-3xl mt-4 border border-gray-100 shadow-sm transition-all hover:shadow-md">
      {/* Top Header: PNR Number, Train, Primary Status Badge */}
      <div className="flex justify-between items-start gap-2 mb-3.5">
        <div className="train-details">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[26px] leading-7 font-plus font-bold text-navy-dark tracking-wide">
              {data.pnrNumber}
            </h2>
            <button
              onClick={handleCopy}
              className="text-[#C8C5D0] hover:text-[#0058BE] transition-colors p-1"
              title="Copy PNR"
              type="button"
            >
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <p className="text-[12px] leading-4 font-inter font-bold text-navy-dark">
            {data.trainNumber} — {data.trainName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`latest-status flex items-center gap-1.5 py-1 px-3 rounded-full border ${primaryStyle.bg} ${primaryStyle.border}`}
          >
            <div className={`w-2 h-2 ${primaryStyle.dot} rounded-full`}></div>
            <p
              className={`text-[11px] leading-3.5 font-bold font-inter ${primaryStyle.text}`}
            >
              {data?.passengerList?.[0]?.currentStatusDetails || primaryStatus}
            </p>
          </div>

          {onRemove && (
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
              title="Remove journey"
              type="button"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Route Badge */}
      <div className="flex items-center justify-between gap-2 bg-light-blue py-2 px-3.5 rounded-xl mb-3.5">
        <div className="flex items-center gap-2">
          <TramFront size={16} className="text-[#0058BE]" />
          <p className="flex items-center gap-2 text-[12px] leading-4 font-inter font-bold text-navy-dark">
            <span>{data.sourceStation || "Source"}</span>
            <MoveRight size={14} className="text-[#0058BE]" />
            <span>{data.destinationStation || "Destination"}</span>
          </p>
        </div>
        {data.journeyClass && (
          <span className="text-[11px] font-bold px-2 py-0.5 bg-white text-navy-dark rounded-md">
            {data.journeyClass} {data.quota ? `· ${data.quota}` : ""}
          </span>
        )}
      </div>

      {/* Train Visual Banner */}
      <div className="relative mb-3.5 rounded-2xl overflow-hidden bg-gradient-to-r from-[#070235] to-[#1E1B4B] min-h-[68px] flex items-center px-4">
        <Image
          src="/Train.png"
          alt="Train"
          width={318}
          height={64}
          className="absolute right-0 bottom-0 opacity-40 object-cover"
        />
        <div className="relative z-10 py-2">
          <p className="text-[10px] leading-3.5 font-inter font-bold text-gray-300 uppercase tracking-wider">
            DEPARTS {departDate}
          </p>
          <h4 className="text-[15px] leading-5 font-inter font-bold text-white mt-0.5">
            {departTime ? `${departTime} · ` : ""}
            {data.boardingPoint ? `Boarding: ${data.boardingPoint}` : "Platform Info Pending"}
          </h4>
        </div>
      </div>

      {/* Passengers Breakdown (Multi-Passenger Support) */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[12px] font-bold text-navy-dark uppercase tracking-wider">
            Passengers ({data?.passengerList?.length || 0})
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            type="button"
            className="flex items-center gap-1 text-[11px] font-bold text-[#0058BE] hover:underline"
          >
            {expanded ? "Collapse" : "View All"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {expanded && (
          <div className="flex flex-col gap-2">
            {data?.passengerList && data.passengerList.length > 0 ? (
              data.passengerList.map((passenger, index) => {
                const pStyle = getStatusStyle(passenger.currentStatus);
                const hasCoach =
                  Boolean(passenger.currentCoachId) &&
                  passenger.currentCoachId !== "NA";
                const hasBerth =
                  Boolean(passenger.currentBerthNo) &&
                  passenger.currentBerthNo !== 0;

                return (
                  <div
                    key={passenger.passengerSerialNumber || index}
                    className="p-3 bg-light-blue/70 rounded-2xl border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs text-navy-dark shadow-2xs">
                        {passenger.passengerSerialNumber || index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-bold text-navy-dark">
                            Passenger {passenger.passengerSerialNumber || index + 1}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium text-blackish-ash flex items-center gap-1 mt-0.5">
                          <Armchair size={12} className="text-[#0058BE]" />
                          {hasCoach || hasBerth ? (
                            <span>
                              Coach:{" "}
                              <strong>
                                {passenger.currentCoachId || passenger.bookingCoachId || "—"}
                              </strong>{" "}
                              · Berth:{" "}
                              <strong>
                                {passenger.currentBerthNo || passenger.bookingBerthNo || "—"}
                              </strong>
                            </span>
                          ) : (
                            <span>Berth not allotted yet</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${pStyle.bg} ${pStyle.text} border ${pStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`}></span>
                        {passenger.currentStatusDetails || passenger.currentStatus}
                      </div>
                      {passenger.bookingStatusDetails &&
                        passenger.bookingStatusDetails !== passenger.currentStatusDetails && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Booking: {passenger.bookingStatusDetails}
                          </p>
                        )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-500 flex items-center gap-2">
                <AlertCircle size={14} /> Passenger details not available yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meta Footer: Chart Status, Schedule, Recipients & Actions */}
      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="text-blackish-ash shrink-0" size={14} />
            <p className="text-[11px] leading-4 font-inter font-normal text-blackish-ash">
              <strong>Chart:</strong> {data.chartStatus || "Chart Not Prepared"}
              {lastChecked && ` · Checked: ${lastChecked}`}
            </p>
          </div>

          {(lastNotifiedAt || lastEmailSentAt || lastTelegramSentAt || lastSmsSentAt) && (
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              Alert sent {lastNotifiedAt || lastEmailSentAt || lastTelegramSentAt || lastSmsSentAt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Users className="text-[#0058BE] shrink-0" size={14} />
          <p className="text-[11px] leading-4 font-inter font-normal text-blackish-ash">
            <strong>Alert Recipients:</strong> {displayRecipients}
            {frequency ? ` · 🔔 ${frequency}` : ""}
          </p>
        </div>

        {/* Action bar for checking status and sending test alerts */}
        {onTriggerCheck && (
          <div className="mt-1 pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
            <div className="text-[11px] text-gray-500 font-medium">
              {checkFeedback ? (
                <span className="text-green-600 font-bold animate-pulse">
                  ✓ {checkFeedback}
                </span>
              ) : (
                <span>Gmail &amp; Telegram alerts enabled</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestTrigger}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#0058BE] bg-light-blue hover:bg-[#e0e7ff] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Running check...
                </>
              ) : (
                <>
                  <Send size={12} />
                  Check &amp; Send Alerts Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
