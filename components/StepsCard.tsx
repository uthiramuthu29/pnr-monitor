import { Ticket, CircleX, UserRound } from "lucide-react";
import { useState } from "react";

type StepsCardProps = {
  title: string;
  desc?: string;
  number: number;
};

export default function StepsCard({ title, desc, number }: StepsCardProps) {
  const [newPnr, setNewPnr] = useState("");

  const frequency = [
    { id: 1, content: "Once per day" },
    { id: 2, content: "Twice per day" },
    { id: 3, content: "Twice per week" },
  ];

  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(
    null,
  );

  const [dailyTime, setDailyTime] = useState("");

  const [twiceDailyTime, setTwiceDailyTime] = useState({
    first: "",
    second: "",
  });

  const [weeklySchedule, setWeeklySchedule] = useState<
    { day: string; time: string }[]
  >([]);

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    const limitedValue = numericValue.slice(0, 10);

    setNewPnr(limitedValue);
  };

  return (
    <div className="steps-card mb-5 bg-white rounded-4xl p-5 ">
      <div className="flex gap-2 items-center mb-2.5 ">
        <div className="text-[14px] text-[#8683BA] bg-[#1E1B4B] w-7 h-7 rounded-full flex justify-center items-center ">
          <p>{number}</p>
        </div>
        <h2 className="text-[18px] leading-6 font-inter font-bold text-navy-dark ">
          {title}
        </h2>
      </div>
      <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash mb-4 ">
        {desc}
      </p>
      {number === 1 ? (
        <div className="relative ">
          <Ticket
            size={20}
            className="absolute top-1/3 left-4 text-blackish-ash "
          />
          <input
            type="text"
            inputMode="numeric"
            value={newPnr}
            onChange={(e) => handleChange(e.target.value)}
            placeholder=""
            className="w-full text-[28px] leading-8 text-navy-dark font-bold font-inter pl-12 pr-14.5 py-4 bg-light-blue rounded-[48px]  "
          />
          <button className="text-blackish-ash absolute top-4 right-4 ">
            <CircleX size={20} />
          </button>
        </div>
      ) : number === 2 ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5 ">
            {frequency.map((freq) => (
              <button
                type="button"
                key={freq.id}
                onClick={() => {
                  setSelectedFrequency(freq.id);
                  if (freq.id === 1) {
                    // Once per day
                    setTwiceDailyTime({ first: "", second: "" });
                    setWeeklySchedule([]);
                  }

                  if (freq.id === 2) {
                    // Twice per day
                    setDailyTime("");
                    setWeeklySchedule([]);
                  }

                  if (freq.id === 3) {
                    // Twice per week
                    setDailyTime("");
                    setTwiceDailyTime({ first: "", second: "" });
                  }
                }}
                className={`${selectedFrequency === freq.id ? "bg-[#2170E4] text-white " : "bg-light-blue text-navy-dark "} px-4.5 py-2.5 text-center text-[14px] leading-4.5 font-bold `}
              >
                {freq.content}
              </button>
            ))}
          </div>
          {selectedFrequency === 1 && (
            <div className="">
              <p>Select notification time</p>
              <input
                type="time"
                value={dailyTime}
                onChange={(e) => {
                  setDailyTime(e.target.value);
                }}
              />
            </div>
          )}

          {selectedFrequency === 2 && (
            <div className="">
              <p>Select two notification times</p>
              <input
                type="time"
                value={twiceDailyTime.first}
                onChange={(e) =>
                  setTwiceDailyTime({
                    ...twiceDailyTime,
                    first: e.target.value,
                  })
                }
              />
              <input
                type="time"
                value={twiceDailyTime.second}
                onChange={(e) =>
                  setTwiceDailyTime({
                    ...twiceDailyTime,
                    second: e.target.value,
                  })
                }
              />
            </div>
          )}

          {selectedFrequency === 3 && (
            <div className="">
              <p>Select two days and time</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const selectedDay = weeklySchedule.find(
                    (item) => item.day === day,
                  );

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setWeeklySchedule((current) => {
                          const alreadySelected = current.some(
                            (item) => item.day === day,
                          );

                          if (alreadySelected) {
                            return current.filter((item) => item.day !== day);
                          }

                          if (current.length >= 2) {
                            return current;
                          }

                          return [...current, { day, time: "" }];
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm ${
                        selectedDay
                          ? "bg-navy-dark text-white"
                          : "bg-light-blue text-navy-dark"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {weeklySchedule.map((schedule, index) => (
                <div key={schedule.day} className="mt-3">
                  <p className="text-sm font-bold text-navy-dark">
                    {schedule.day}
                  </p>

                  <input
                    type="time"
                    value={schedule.time}
                    onChange={(e) => {
                      const newTime = e.target.value;

                      setWeeklySchedule((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, time: newTime } : item,
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
        <div className="bg-light-blue p-3 flex gap-3 items-center ">
          <div className="bg-[#D8E2FF] p-3.5 rounded-full ">
            <UserRound size={16} />
          </div>
          <div>
            <p className="text-[14px] font-bold leading-4.5 text-navy-dark ">Mom</p>
            <p className="text-[12px] font-normal leading-4 text-blackish-ash ">+91 98765 43210</p>
          </div>
          <div className="w-6 h-6 bg-[#E2E7FF] ml-auto rounded-full "></div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
