"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/PageHeading";
import StepsCard, { Recipient } from "@/components/StepsCard";
import { CheckCircle2, Loader2, X } from "lucide-react";
import type { TrackedPnr } from "@/types/pnr";

type AddPnrProps = {
  onClose: () => void;
  onTracked?: (pnr: TrackedPnr) => void;
  initialPnr?: string;
};

export default function AddPnr({
  onClose,
  onTracked,
  initialPnr = "",
}: AddPnrProps) {
  const [pnr, setPnr] = useState(initialPnr);
  const [selectedFrequency, setSelectedFrequency] = useState(1);
  const [dailyTime, setDailyTime] = useState("09:00");
  const [twiceDailyTime, setTwiceDailyTime] = useState({
    first: "09:00",
    second: "18:00",
  });
  const [weeklySchedule, setWeeklySchedule] = useState<
    { day: string; time: string }[]
  >([
    { day: "Monday", time: "09:00" },
    { day: "Thursday", time: "09:00" },
  ]);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load alert contacts from MongoDB
  useEffect(() => {
    async function fetchRecipients() {
      try {
        const res = await fetch("/api/recipients");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRecipients(
            json.data.map(
              (
                r: {
                  name: string;
                  channel?: "email" | "telegram";
                  email?: string;
                  telegramChatId?: string;
                  phone?: string;
                  _id?: string;
                },
                idx: number,
              ) => ({
                id: idx + 1,
                name: r.name,
                channel: r.channel || (r.telegramChatId ? "telegram" : "email"),
                email: r.email || "",
                telegramChatId: r.telegramChatId || "",
                phone: r.phone || "",
                selected: true,
              }),
            ),
          );
        }
      } catch (err) {
        console.warn("Failed to fetch MongoDB recipients:", err);
        setRecipients([
          {
            id: 1,
            name: "Self",
            channel: "email",
            email: "uthiramuthusp29@gmail.com",
            selected: true,
          },
          {
            id: 2,
            name: "Shanmugavelu",
            channel: "email",
            email: "shanmugavelu434@gmail.com",
            selected: true,
          },
        ]);
      }
    }
    fetchRecipients();
  }, []);

  const handleToggleRecipient = (id: number) => {
    setRecipients((current) =>
      current.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  const handleAddRecipient = (
    name: string,
    destination: string,
    channel: "email" | "telegram",
  ) => {
    setRecipients((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        channel,
        email: channel === "email" ? destination : "",
        telegramChatId: channel === "telegram" ? destination : "",
        selected: true,
      },
    ]);
  };

  const handleStartTracking = async () => {
    if (pnr.length !== 10) {
      setError("Please enter a valid 10-digit PNR");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const scheduleType =
        selectedFrequency === 1
          ? "once_daily"
          : selectedFrequency === 2
            ? "twice_daily"
            : "weekly";

      const notificationTimes =
        selectedFrequency === 1
          ? [dailyTime]
          : selectedFrequency === 2
            ? [twiceDailyTime.first, twiceDailyTime.second]
            : [];

      const weeklyDays = selectedFrequency === 3 ? weeklySchedule : [];

      const selectedRecipients = recipients
        .filter((r) => r.selected)
        .map((r) => ({
          name: r.name,
          channel: r.channel || "email",
          email: r.email,
          telegramChatId: r.telegramChatId,
          phone: r.phone,
        }));

      // Send to MongoDB via /api/pnrs
      const res = await fetch("/api/pnrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pnrNumber: pnr,
          scheduleType,
          notificationTimes,
          weeklyDays,
          recipients: selectedRecipients,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to register PNR in MongoDB");
      }

      onTracked?.(json.data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate monitoring in database",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="add-pnr-modal-overlay"
      className="fixed inset-0 top-0 left-0 w-full h-full min-h-screen z-[9999] bg-[#FAF8FF] overflow-y-auto p-4 sm:p-6 flex flex-col justify-between"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="max-w-md mx-auto w-full pb-32">
        {/* Header with Close / Dismiss button */}
        <div className="flex justify-between items-start mb-2 pt-1">
          <PageHeading
            title="Add New PNR"
            desc="Set exact alert schedule & Gmail / Telegram recipients."
          />
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-light-blue text-navy-dark hover:bg-gray-200 active:scale-95 transition-all ml-2 shrink-0 cursor-pointer touch-manipulation"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <StepsCard
          title="Enter 10-Digit PNR"
          number={1}
          pnr={pnr}
          onPnrChange={(val) => {
            setPnr(val);
            if (error) setError("");
          }}
        />

        <StepsCard
          title="Notification Schedule"
          desc="Only query IRCTC at your specified exact time (no aggressive polling)."
          number={2}
          selectedFrequency={selectedFrequency}
          onFrequencyChange={setSelectedFrequency}
          dailyTime={dailyTime}
          onDailyTimeChange={setDailyTime}
          twiceDailyTime={twiceDailyTime}
          onTwiceDailyTimeChange={setTwiceDailyTime}
          weeklySchedule={weeklySchedule}
          onWeeklyScheduleChange={setWeeklySchedule}
        />

        <StepsCard
          title="Alert Recipients"
          desc="Dispatched via Gmail & Telegram directly to selected contacts at your scheduled times."
          number={3}
          recipients={recipients}
          onToggleRecipient={handleToggleRecipient}
          onAddRecipient={handleAddRecipient}
        />
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[10000] shadow-lg">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 rounded-3xl text-sm font-bold text-navy-dark bg-light-blue hover:bg-gray-200 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartTracking}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-3xl text-sm font-bold text-white bg-[#0058BE] hover:bg-[#00479c] active:scale-95 shadow-md transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving to Database...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Save Schedule {pnr ? `(${pnr})` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
