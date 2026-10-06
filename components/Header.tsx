import Image from "next/image";
import { UserRound } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-[rgba(250,248,255,0.85)] p-4 flex justify-between items-center ">
      <div className="logo flex gap-2 ">
        <Image src="/PNR-Monitor-Logo.svg" alt="PNR Monitor" width={25} height={25} />
        <div className="header-content">
          <h1 className="text-[18px] leading-4.5 text-navy-dark font-inter font-bold " >PNR Monitor</h1>
          <p className="text-[11px] leading-3.5 text-blackish-ash font-inter font-bold uppercase ">Home</p>
        </div>
      </div>
      <div className="bg-navy-dark p-2.5 rounded-full " >
        <UserRound className="text-white " size={16} />
      </div>
    </div>
  );
}
