import { Ticket, CircleX } from "lucide-react";
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

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    const limitedValue = numericValue.slice(0, 10);

    setNewPnr(limitedValue);
  };

  return (
    <div className="steps-card mb-5 bg-white rounded-4xl p-5 ">
      <div className="flex gap-2 items-center ">
        <div className="text-[14px] text-[#8683BA] bg-[#1E1B4B] w-7 h-7 rounded-full flex justify-center items-center ">
          <p>{number}</p>
        </div>
        <h2 className="text-[18px] leading-6 font-inter font-bold text-navy-dark ">
          {title}
        </h2>
      </div>
      <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash ">
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
        <div className="flex gap-1.5 ">
          {frequency.map((freq) => (
            <button key={freq.id} className="bg-light-blue px-7.5 py-2.5 text-center text-[14px] ">
              {freq.content}
            </button>
          ))}
        </div>
      ) : number === 3 ? (
        <div className=""></div>
      ) : (
        <></>
      )}
    </div>
  );
}
