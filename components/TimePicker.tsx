"use client";

import { Clock } from "lucide-react";

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
};

const presets = [
  { label: "08:00 AM", value: "08:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "06:00 PM", value: "18:00" },
  { label: "09:00 PM", value: "21:00" },
];

export default function TimePicker({ value = "09:00", onChange }: TimePickerProps) {
  const currentTime = value || "09:00";

  // Format 24h to 12h for display
  const formatDisplayTime = (val: string) => {
    try {
      const [hStr, mStr] = val.split(":");
      const h = parseInt(hStr, 10);
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, "0")}:${mStr || "00"} ${period}`;
    } catch {
      return val;
    }
  };

  return (
    <div className="rounded-2xl bg-light-blue p-4 border border-[#E2E7FF]">
      <div className="flex items-center justify-between gap-3 mb-3">
        <label
          htmlFor="time-input"
          className="text-xs font-bold text-navy-dark flex items-center gap-1.5"
        >
          <Clock size={15} className="text-[#0058BE]" />
          <span>Selected Time:</span>
        </label>
        <span className="text-sm font-bold text-[#0058BE] bg-white px-3 py-1 rounded-xl shadow-2xs border border-gray-100">
          {formatDisplayTime(currentTime)}
        </span>
      </div>

      {/* Native Time Input - Opens native drum-roll wheel picker on iOS & Material clock on Android */}
      <div className="relative mb-3">
        <input
          id="time-input"
          type="time"
          value={currentTime}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center text-xl font-bold bg-white text-navy-dark py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0058BE] cursor-pointer shadow-xs"
        />
      </div>

      {/* Quick Time Presets */}
      <div>
        <p className="text-[11px] font-bold text-blackish-ash mb-1.5">
          Quick Suggestions:
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                currentTime === preset.value
                  ? "bg-[#0058BE] text-white shadow-2xs"
                  : "bg-white text-navy-dark border border-gray-100 hover:bg-gray-50 active:scale-95"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}