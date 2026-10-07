"use client";

import { useState } from "react";
import PageHeading from "@/components/PageHeading";
import StatusCard from "@/components/StatusCard";
import AddPnr from "@/components/AddPnr";
import { Search, Clipboard, Plus } from "lucide-react";

import type { PnrResponse } from "@/types/pnr";

export default function Home() {
  const [pnr, setPnr] = useState("");
  const [error, setError] = useState("");

  const [addPnr, setAddPnr] = useState(false);

  const [pnrData, setPnrData] = useState<PnrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const isValidPnr = pnr.length === 10;

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    const limitedValue = numericValue.slice(0, 10);

    setPnr(limitedValue);

    if (error) {
      setError("");
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const numericValue = clipboardText.replace(/\D/g, "").slice(0, 10);
      setPnr(numericValue);
      setError("");
    } catch {
      setError("Unable to access clipboard");
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

      console.log("PNR Data:", data);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Unable to check PNR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      <div className="flex justify-between items-baseline">
        <PageHeading
          title="Your PNRs"
          desc="3 journeys currently being tracked"
        />
        <button
          onClick={() => setAddPnr(true)}
          className="flex items-center text-white bg-[#0058BE] text-[14px] font-bold font-inter leading-4.5 gap-1.5 px-5 py-3 rounded-4xl "
        >
          <Plus size={16} />
          Add PNR
        </button>
      </div>

      {addPnr && <AddPnr />}

      <div className="flex bg-light-blue px-4 py-2.5 items-center gap-2 rounded-2xl mb-4 ">
        <div className="bg-green-600 rounded-full w-2.5 h-2.5 "></div>
        <p className="text-[12px] leading-4 font-inter font-bold text-navy-dark ">
          Live monitoring · Checked 2m ago
        </p>
        <p className="text-[11px] leading-3.5 font-inter font-bold text-blackish-ash ml-auto ">
          NEXT IN 3M
        </p>
      </div>
      <div className="relative ">
        <Search
          size={15}
          className="absolute top-1/3 left-4 text-blackish-ash "
        />
        <input
          type="text"
          inputMode="numeric"
          value={pnr}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter or paste 10-digit PNR"
          className="w-full text-[14px] text-[#787680] font-bold font-inter pl-10 pr-22 py-4 bg-white rounded-4xl  "
        />
        <button
          onClick={isValidPnr ? handleSubmit : handlePaste}
          className="flex items-center text-[11px] font-bold font-inter leading-3.5 text-navy-dark bg-light-blue rounded-3xl px-3.5 py-2.5 gap-1 uppercase absolute top-2 right-4 "
        >
          {loading ? (
            "Checking...."
          ) : isValidPnr ? (
            <>
              <Search size={15} />
              Get Status
            </>
          ) : (
            <>
              <Clipboard size={15} />
              Paste
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 px-2 text-xs font-inter text-red-500">{error}</p>
      )}

      {pnrData && <StatusCard data={pnrData.data} />}
    </section>
  );
}
