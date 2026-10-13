import { Ticket, CircleX, Check, Plus, Mail, Send } from "lucide-react";
import { useState } from "react";
import TimePicker from "@/components/TimePicker";

export type Recipient = {
  id: number;
  name: string;
  channel?: "email" | "telegram";
  email?: string;
  telegramChatId?: string;
  phone?: string;
  selected: boolean;
};

type StepsCardProps = {
  title: string;
  desc?: string;
  number: number;
  // Step 1
  pnr?: string;
  onPnrChange?: (value: string) => void;
  // Step 2
  selectedFrequency?: number;
  onFrequencyChange?: (freq: number) => void;
  dailyTime?: string;
  onDailyTimeChange?: (time: string) => void;
  twiceDailyTime?: { first: string; second: string };
  onTwiceDailyTimeChange?: (times: { first: string; second: string }) => void;
  weeklySchedule?: { day: string; time: string }[];
  onWeeklyScheduleChange?: (schedule: { day: string; time: string }[]) => void;
  // Step 3
  recipients?: Recipient[];
  onToggleRecipient?: (id: number) => void;
  onAddRecipient?: (
    name: string,
    destination: string,
    channel: "email" | "telegram",
  ) => void;
};

export default function StepsCard({
  title,
  desc,
  number,
  pnr = "",
  onPnrChange,
  selectedFrequency = 1,
  onFrequencyChange,
  dailyTime = "09:00",
  onDailyTimeChange,
  twiceDailyTime = { first: "09:00", second: "18:00" },
  onTwiceDailyTimeChange,
  weeklySchedule = [],
  onWeeklyScheduleChange,
  recipients = [],
  onToggleRecipient,
  onAddRecipient,
}: StepsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientChannel, setNewRecipientChannel] = useState<
    "email" | "telegram"
  >("email");
  const [newRecipientDestination, setNewRecipientDestination] = useState("");

  const frequency = [
    { id: 1, content: "Once per day" },
    { id: 2, content: "Twice per day" },
    { id: 3, content: "Twice per week" },
  ];

  const handlePnrInput = (val: string) => {
    const numeric = val.replace(/\D/g, "").slice(0, 10);
    onPnrChange?.(numeric);
  };

  const handleAddRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecipientName.trim() && newRecipientDestination.trim()) {
      onAddRecipient?.(
        newRecipientName.trim(),
        newRecipientDestination.trim(),
        newRecipientChannel,
      );
      setNewRecipientName("");
      setNewRecipientDestination("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="steps-card mb-5 bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
      <div className="flex gap-2 items-center mb-2.5">
        <div className="text-[14px] text-[#8683BA] bg-[#1E1B4B] w-7 h-7 rounded-full flex justify-center items-center font-bold">
          <p>{number}</p>
        </div>
        <h2 className="text-[18px] leading-6 font-inter font-bold text-navy-dark">
          {title}
        </h2>
      </div>

      {desc && (
        <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash mb-4">
          {desc}
        </p>
      )}

      {number === 1 ? (
        <div className="relative">
          <Ticket
            size={20}
            className="absolute top-1/2 -translate-y-1/2 left-4 text-blackish-ash"
          />
          <input
            type="text"
            inputMode="numeric"
            value={pnr}
            onChange={(e) => handlePnrInput(e.target.value)}
            placeholder="10-digit PNR"
            className="w-full text-[24px] sm:text-[28px] leading-8 text-navy-dark font-bold font-inter pl-12 pr-12 py-3.5 bg-light-blue rounded-2xl tracking-wider"
          />
          {pnr && (
            <button
              type="button"
              onClick={() => onPnrChange?.("")}
              className="text-blackish-ash hover:text-navy-dark absolute top-1/2 -translate-y-1/2 right-4 p-1 cursor-pointer"
            >
              <CircleX size={20} />
            </button>
          )}
        </div>
      ) : number === 2 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {frequency.map((freq) => (
              <button
                type="button"
                key={freq.id}
                onClick={() => onFrequencyChange?.(freq.id)}
                className={`${
                  selectedFrequency === freq.id
                    ? "bg-[#2170E4] text-white shadow-xs"
                    : "bg-light-blue text-navy-dark hover:bg-gray-200"
                } px-4 py-2.5 rounded-xl text-center text-[13px] leading-4.5 font-bold transition-all cursor-pointer`}
              >
                {freq.content}
              </button>
            ))}
          </div>

          {selectedFrequency === 1 && (
            <div className="mt-2">
              <p className="text-xs font-bold text-navy-dark mb-2">
                Notification time
              </p>
              <TimePicker
                value={dailyTime}
                onChange={(time) => onDailyTimeChange?.(time)}
              />
            </div>
          )}

          {selectedFrequency === 2 && (
            <div className="mt-2 flex flex-col gap-3">
              <div>
                <p className="text-xs font-bold text-navy-dark mb-1">
                  First alert
                </p>
                <TimePicker
                  value={twiceDailyTime.first}
                  onChange={(time) =>
                    onTwiceDailyTimeChange?.({
                      ...twiceDailyTime,
                      first: time,
                    })
                  }
                />
              </div>

              <div>
                <p className="text-xs font-bold text-navy-dark mb-1">
                  Second alert
                </p>
                <TimePicker
                  value={twiceDailyTime.second}
                  onChange={(time) =>
                    onTwiceDailyTimeChange?.({
                      ...twiceDailyTime,
                      second: time,
                    })
                  }
                />
              </div>
            </div>
          )}

          {selectedFrequency === 3 && (
            <div className="mt-2">
              <p className="text-xs font-bold text-navy-dark mb-2">
                Select 2 days to receive updates
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const isSelected = weeklySchedule.some(
                    (item) => item.day === day,
                  );

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          onWeeklyScheduleChange?.(
                            weeklySchedule.filter((item) => item.day !== day),
                          );
                        } else if (weeklySchedule.length < 2) {
                          onWeeklyScheduleChange?.([
                            ...weeklySchedule,
                            { day, time: "09:00" },
                          ]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-navy-dark text-white"
                          : "bg-light-blue text-navy-dark hover:bg-gray-200"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              {weeklySchedule.map((schedule) => (
                <div key={schedule.day} className="mt-3">
                  <p className="text-xs font-bold text-navy-dark mb-1">
                    {schedule.day} time
                  </p>
                  <TimePicker
                    value={schedule.time}
                    onChange={(time) => {
                      onWeeklyScheduleChange?.(
                        weeklySchedule.map((item) =>
                          item.day === schedule.day ? { ...item, time } : item,
                        ),
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : number === 3 ? (
        <div className="flex flex-col gap-2.5">
          {recipients.map((recipient) => {
            const isTelegram =
              recipient.channel === "telegram" ||
              (!recipient.channel && recipient.telegramChatId);
            const destination = isTelegram
              ? recipient.telegramChatId || "Telegram Bot"
              : recipient.email || recipient.phone || "Email";

            return (
              <div
                key={recipient.id}
                onClick={() => onToggleRecipient?.(recipient.id)}
                className={`p-3.5 flex gap-3 items-center rounded-2xl cursor-pointer transition-all border ${
                  recipient.selected
                    ? "bg-light-blue border-[#0058BE]/30"
                    : "bg-white border-gray-200 opacity-60"
                }`}
              >
                <div
                  className={`p-2.5 rounded-full ${
                    recipient.selected
                      ? isTelegram
                        ? "bg-[#E6F4FB] text-[#0088cc]"
                        : "bg-[#D8E2FF] text-[#0058BE]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isTelegram ? <Send size={15} /> : <Mail size={15} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-bold leading-4 text-navy-dark">
                      {recipient.name}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isTelegram
                          ? "bg-sky-50 text-[#0088cc] border border-sky-200"
                          : "bg-blue-50 text-[#0058BE] border border-blue-200"
                      }`}
                    >
                      {isTelegram ? "Telegram" : "Gmail"}
                    </span>
                  </div>
                  <p className="text-[11px] font-normal leading-3.5 text-blackish-ash mt-0.5">
                    {destination}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    recipient.selected
                      ? "bg-[#0058BE] border-[#0058BE] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {recipient.selected && <Check size={14} />}
                </div>
              </div>
            );
          })}

          {showAddForm ? (
            <form
              onSubmit={handleAddRecipientSubmit}
              className="mt-2 p-3.5 bg-light-blue rounded-2xl flex flex-col gap-2.5 border border-gray-200/60"
            >
              {/* Channel Selector */}
              <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setNewRecipientChannel("email")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    newRecipientChannel === "email"
                      ? "bg-[#0058BE] text-white shadow-xs"
                      : "text-navy-dark hover:bg-gray-100"
                  }`}
                >
                  <Mail size={13} /> Gmail
                </button>
                <button
                  type="button"
                  onClick={() => setNewRecipientChannel("telegram")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    newRecipientChannel === "telegram"
                      ? "bg-[#0088cc] text-white shadow-xs"
                      : "text-navy-dark hover:bg-gray-100"
                  }`}
                >
                  <Send size={12} /> Telegram
                </button>
              </div>

              <input
                type="text"
                placeholder="Recipient Name (e.g. Sister, Mom)"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                className="bg-white rounded-xl px-3 py-2 text-xs font-semibold text-navy-dark border border-gray-200 focus:border-[#0058BE] outline-none"
                required
              />

              <input
                type={newRecipientChannel === "email" ? "email" : "text"}
                placeholder={
                  newRecipientChannel === "email"
                    ? "Gmail / Email (e.g. user@gmail.com)"
                    : "Telegram Chat ID (e.g. 123456789)"
                }
                value={newRecipientDestination}
                onChange={(e) => setNewRecipientDestination(e.target.value)}
                className="bg-white rounded-xl px-3 py-2 text-xs font-semibold text-navy-dark border border-gray-200 focus:border-[#0058BE] outline-none"
                required
              />

              <div className="flex gap-2 justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blackish-ash hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0058BE] text-white cursor-pointer"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#0058BE] hover:underline cursor-pointer"
            >
              <Plus size={14} /> Add another recipient
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
