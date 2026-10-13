"use client";

import { useState } from "react";
import PageHeading from "@/components/PageHeading";
import StatusCard from "@/components/StatusCard";
import AddPnr from "@/components/AddPnr";
import { Plus, Ticket, RefreshCw, Loader2 } from "lucide-react";
import { useTrackedPnrs } from "@/lib/useTrackedPnrs";

export default function PnrsPage() {
  const {
    trackedPnrs,
    loading: journeysLoading,
    addTrackedPnr,
    removeTrackedPnr,
    triggerCheck,
    refresh,
  } = useTrackedPnrs();
  const [addPnr, setAddPnr] = useState(false);

  return (
    <section className="pb-10">
      <div className="flex justify-between items-baseline mb-4">
        <PageHeading
          title="Monitored PNRs"
          desc="Manage all active IRCTC journeys & exact-time Gmail / Telegram alerts"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="p-2.5 rounded-full bg-light-blue text-[#0058BE] hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
            title="Refresh from MongoDB"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => setAddPnr(true)}
            className="flex items-center text-white bg-[#0058BE] hover:bg-[#00479c] active:scale-95 transition-all text-[13px] font-bold font-inter leading-4.5 gap-1.5 px-4.5 py-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer shrink-0 touch-manipulation select-none"
          >
            <Plus size={16} />
            Add PNR
          </button>
        </div>
      </div>

      {addPnr && (
        <AddPnr
          onClose={() => setAddPnr(false)}
          onTracked={(newTracked) => {
            addTrackedPnr(newTracked);
          }}
        />
      )}

      {journeysLoading && trackedPnrs.length === 0 ? (
        <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
          <Loader2 size={24} className="animate-spin text-[#0058BE]" />
          <p className="text-xs text-blackish-ash font-medium">
            Fetching journeys from database...
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
                      Schedule: {item.frequency}
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
        <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center shadow-xs">
          <Ticket size={40} className="mx-auto text-[#0058BE] mb-3" />
          <h3 className="text-base font-bold text-navy-dark">
            No PNRs tracked yet
          </h3>
          <p className="text-xs text-blackish-ash mt-1 max-w-xs mx-auto">
            Add a PNR to track status movements, RAC progressions, and chart preparation at your chosen exact time.
          </p>
          <button
            type="button"
            onClick={() => setAddPnr(true)}
            className="mt-4 px-5 py-2.5 bg-[#0058BE] text-white text-xs font-bold rounded-full hover:bg-[#00479c] active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            + Add New PNR
          </button>
        </div>
      )}
    </section>
  );
}