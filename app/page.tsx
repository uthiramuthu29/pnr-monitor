"use client";

import { useState } from "react";
import PageHeading from "@/components/PageHeading";
import StatusCard from "@/components/StatusCard";
import AddPnr from "@/components/AddPnr";
import { Search, Clipboard, Plus, ShieldCheck, RefreshCw, Loader2 } from "lucide-react";
import type { PnrResponse } from "@/types/pnr";
import { useTrackedPnrs } from "@/lib/useTrackedPnrs";

export default function Home() {
  const [pnr, setPnr] = useState("");
  const [error, setError] = useState("");
  const [addPnr, setAddPnr] = useState(false);
  const [modalInitialPnr, setModalInitialPnr] = useState("");
  const [pnrData, setPnrData] = useState<PnrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    trackedPnrs,
    loading: journeysLoading,
    addTrackedPnr,
    removeTrackedPnr,
    triggerCheck,
    refresh,
  } = useTrackedPnrs();

  const isValidPnr = pnr.length === 10;

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    setPnr(numericValue);
    if (error) setError("");
  };

  const handlePaste = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.readText
      ) {
        const clipboardText = await navigator.clipboard.readText();
        const numericValue = clipboardText.replace(/\D/g, "").slice(0, 10);
        setPnr(numericValue);
        setError("");
      } else {
        setError("Type your 10-digit PNR in the box");
      }
    } catch {
      setError("Type your 10-digit PNR in the box");
    }
  };

  const handleSubmit = async () => {
    if (pnr.length !== 10) {
      setError("PNR must contain exactly 10 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/pnr?pnr=${pnr}`);
      const data: PnrResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch PNR status");
      }

      setPnrData(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to check PNR");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackCurrentQuery = () => {
    if (!pnrData?.data) return;
    setModalInitialPnr(pnrData.data.pnrNumber);
    setAddPnr(true);
  };

  const openAddModal = (initial = "") => {
    setModalInitialPnr(initial);
    setAddPnr(true);
  };

  const totalTracked = trackedPnrs.length;

  return (
    <section className="pb-10">
      {/* Header bar with title and Add PNR button */}
      <div className="flex justify-between items-baseline mb-2">
        <PageHeading
          title="Your PNRs"
          desc={`${totalTracked} ${
            totalTracked === 1 ? "journey" : "journeys"
          } saved in MongoDB`}
        />
        <button
          type="button"
          onClick={() => openAddModal("")}
          className="flex items-center text-white bg-[#0058BE] hover:bg-[#00479c] active:scale-95 transition-all text-[13px] font-bold font-inter leading-4.5 gap-1.5 px-4.5 py-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer shrink-0 touch-manipulation select-none"
        >
          <Plus size={16} />
          Add PNR
        </button>
      </div>

      {/* Add PNR Modal Overlay */}
      {addPnr && (
        <AddPnr
          initialPnr={modalInitialPnr}
          onClose={() => {
            setAddPnr(false);
            setModalInitialPnr("");
          }}
          onTracked={(newTracked) => {
            addTrackedPnr(newTracked);
          }}
        />
      )}

      {/* Exact-Time Monitoring Banner (No interval polling) */}
      <div className="flex bg-light-blue px-4 py-2.5 items-center gap-2 rounded-2xl mb-4 border border-[#E2E7FF]">
        <div className="bg-green-600 rounded-full w-2.5 h-2.5 animate-pulse"></div>
        <p className="text-[12px] leading-4 font-inter font-bold text-navy-dark">
          Exact-time scheduled checks · MongoDB synced
        </p>
        <span className="text-[10px] leading-3.5 font-inter font-bold text-[#0058BE] ml-auto uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded-full border border-blue-100">
          Gmail &amp; Telegram
        </span>
      </div>

      {/* PNR Search & Paste Bar */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute top-1/2 -translate-y-1/2 left-4 text-blackish-ash"
        />
        <input
          type="text"
          inputMode="numeric"
          value={pnr}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter or paste 10-digit PNR"
          className="w-full text-[14px] text-navy-dark placeholder-[#787680] font-bold font-inter pl-11 pr-24 py-3.5 bg-white rounded-full shadow-xs border border-gray-100 focus:border-[#0058BE] transition-colors"
        />
        <button
          type="button"
          onClick={isValidPnr ? handleSubmit : handlePaste}
          className="flex items-center text-[11px] font-bold font-inter leading-3.5 text-navy-dark bg-light-blue hover:bg-[#e2e5ff] active:scale-95 rounded-full px-3.5 py-2 gap-1 uppercase absolute top-1/2 -translate-y-1/2 right-2 transition-all cursor-pointer touch-manipulation select-none"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Checking...
            </span>
          ) : isValidPnr ? (
            <>
              <Search size={13} />
              Get Status
            </>
          ) : (
            <>
              <Clipboard size={13} />
              Paste
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Queried PNR Result (if any) */}
      {pnrData?.data && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1 px-1">
            <span className="text-xs font-bold text-[#0058BE] uppercase tracking-wider">
              Search Result
            </span>
            <button
              type="button"
              onClick={handleTrackCurrentQuery}
              disabled={trackedPnrs.some(
                (p) => p.pnrNumber === pnrData.data.pnrNumber,
              )}
              className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 active:scale-95 px-2.5 py-1 rounded-full border border-green-200 transition-all disabled:opacity-50 cursor-pointer touch-manipulation"
            >
              {trackedPnrs.some((p) => p.pnrNumber === pnrData.data.pnrNumber)
                ? "✓ Currently Tracked"
                : "+ Add Schedule & SMS"}
            </button>
          </div>
          <StatusCard data={pnrData.data} />
        </div>
      )}

      {/* Monitored Journeys from MongoDB */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-[15px] font-bold text-navy-dark">
            Monitored Journeys ({trackedPnrs.length})
          </h3>
          <button
            type="button"
            onClick={() => refresh()}
            className="text-xs font-bold text-[#0058BE] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} /> Sync
          </button>
        </div>

        {journeysLoading && trackedPnrs.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#0058BE]" />
            <p className="text-xs text-blackish-ash font-medium">
              Loading journeys from database...
            </p>
          </div>
        ) : trackedPnrs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {trackedPnrs.map((item) => (
              <div key={item.pnrNumber}>
                {item.data ? (
                  <StatusCard
                    data={item.data}
                    recipients={item.recipients}
                    frequency={item.frequency}
                    lastChecked={item.lastChecked}
                    lastNotifiedAt={item.lastNotifiedAt}
                    lastEmailSentAt={item.lastEmailSentAt}
                    lastTelegramSentAt={item.lastTelegramSentAt}
                    lastSmsSentAt={item.lastSmsSentAt}
                    onRemove={() => removeTrackedPnr(item.pnrNumber)}
                    onTriggerCheck={() => triggerCheck(item.pnrNumber)}
                  />
                ) : (
                  <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xs flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-navy-dark">
                        {item.pnrNumber}
                      </h4>
                      <p className="text-xs text-blackish-ash">
                        Schedule: {item.frequency} · Initializing details...
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTrackedPnr(item.pnrNumber)}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer touch-manipulation"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-3xl border border-gray-100 text-center shadow-xs">
            <ShieldCheck size={36} className="mx-auto text-[#0058BE] mb-2" />
            <h4 className="text-sm font-bold text-navy-dark">
              No Journeys Monitored Yet
            </h4>
            <p className="text-xs text-blackish-ash mt-1 max-w-xs mx-auto">
              Enter a 10-digit PNR above or tap &quot;Add PNR&quot; to set up your exact alert time and Gmail / Telegram recipients.
            </p>
            <button
              type="button"
              onClick={() => openAddModal("")}
              className="mt-3 px-4 py-2 bg-[#0058BE] text-white text-xs font-bold rounded-full hover:bg-[#00479c] active:scale-95 transition-all cursor-pointer touch-manipulation"
            >
              + Add Your First PNR
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
