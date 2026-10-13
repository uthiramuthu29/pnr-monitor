import Image from "next/image";
import { UserRound } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8FF]/90 backdrop-blur-md border-b border-gray-100/50 px-4 py-3">
      <div className="max-w-lg mx-auto flex justify-between items-center w-full">
        <Link href="/" className="logo flex items-center gap-2.5">
          <Image
            src="/PNR-Monitor-Logo.svg"
            alt="PNR Monitor"
            width={26}
            height={26}
            className="w-auto h-6"
          />
          <div className="header-content">
            <h1 className="text-[17px] leading-5 text-navy-dark font-inter font-bold">
              PNR Monitor
            </h1>
            <p className="text-[10px] leading-3 text-blackish-ash font-inter font-bold uppercase tracking-wider">
              IRCTC Alerts
            </p>
          </div>
        </Link>
        <div className="bg-navy-dark p-2 rounded-full shadow-xs cursor-pointer hover:opacity-90 transition-opacity">
          <UserRound className="text-white" size={15} />
        </div>
      </div>
    </header>
  );
}
