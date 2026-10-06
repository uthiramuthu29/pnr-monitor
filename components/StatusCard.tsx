import {
  Copy,
  TramFront,
  MoveRight,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react";
import Image from "next/image";

import type { PnrData } from "@/types/pnr";

type StatusCardProps = {
  data: PnrData;
};

export default function StatusCard({ data }: StatusCardProps) {
  const journeyDate = new Date(data.dateOfJourney);

  const departDate = journeyDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  const departTime = journeyDate.toLocaleDateString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="p-5 bg-white rounded-4xl mt-4 ">
      <div className="flex justify-between items-baseline ">
        <div className="train-details mb-3.5 ">
          <h2 className="text-[28px] leading-7 font-plus font-bold text-navy-dark mb-1 ">
            {data.pnrNumber}
          </h2>
          <p className="text-[12px] leading-4.5 font-inter font-bold text-navy-dark ">
            {data.trainNumber} — {data.trainName}
          </p>
        </div>
        <Copy
          size={16}
          className="text-[#C8C5D0] hover:text-[#9b98a1] cursor-pointer  "
        />
        <div className="latest-status flex items-center gap-1.5 py-1 px-3 bg-[#ECFDF5] rounded-4xl ">
          <div
            className={`w-2 h-2 ${data.passengerList[0].currentStatus === "CNF" ? "bg-green-600" : data.passengerList[0].currentStatus === "RAC" ? "bg-orange-600" : data.passengerList[0].currentStatus === "WL" ? "bg-red-600" : "bg-gray-600"}  rounded-full `}
          ></div>
          <p className={`text-[11px] leading-3.5 font-bold font-inter ${data.passengerList[0].currentStatus === "CNF" ? "text-green-800" : data.passengerList[0].currentStatus === "RAC" ? "text-orange-800" : data.passengerList[0].currentStatus === "WL" ? "text-red-800" : "text-gray-800" } `}>
            {data.passengerList[0].currentStatusDetails}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-light-blue py-2 px-3 mb-4 ">
        <TramFront size={16} />
        <p className="flex items-center gap-2 text-[12px] leading-4 font-inter font-bold text-navy-dark ">
          {data.sourceStation} <MoveRight /> {data.destinationStation}
        </p>
      </div>
      <div className="relative mb-3.5 ">
        <Image src="/Train.png" alt="Train" width={318} height={64} />
        <div className="absolute top-3.5 left-4 ">
          <p className="text-[11px] leading-3.5 font-inter font-bold text-white">
            DEPARTS {departDate}
          </p>
          <h4 className="text-[16px] leading-5 font-inter font-bold text-white">
            {departTime} · Platform N/A
          </h4>
        </div>
      </div>
      <div className="flex gap-1.5 mb-7.5 ">
        <Clock className="text-blackish-ash" size={16} />
        <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash">
          {data.chartStatus}
        </p>
      </div>
      <div className="flex gap-1.5 mb-6 ">
        <Users className="text-[#0058BE]" size={16} />
        <p className="text-[12px] leading-4 font-inter font-normal text-blackish-ash">
          <strong className="text-navy-dark">2 recipients</strong> (Mom, Dad)
        </p>
      </div>
      <div className="">
        <button className="flex gap-0.5 items-center mx-auto text-[11px] leading-3.5 font-inter font-bold text-[#2170E4] ">
          Tap to view details & simulation <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
