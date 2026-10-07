import { House, Ticket, Users, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  type navLinksType = {
    id: number,
    name: string;
    icon: LucideIcon;
    link: string;
  };

  const navLinks: navLinksType[] = [
    { id: 1, name: "Home", icon: House, link: "/" },
    { id: 2, name: "PNRs", icon: Ticket, link: "/pnrs" },
    { id: 3, name: "Reciepients", icon: Users, link: "/reciepients" },
    { id: 4, name: "Settings", icon: Settings, link: "/settings" },
  ];

  return (
    <nav className="fixed z-99 bottom-0 w-full bg-white ">
      <ul className="flex justify-between px-5 py-2 ">
        {navLinks.map((navLink: navLinksType) => {
          const Icon = navLink.icon;
          return(
            <Link href={navLink.link} className="text-[12px] leading-4 font-bold font-inter   " key={navLink.id}><Icon className="mx-auto" size={22} />{navLink.name}</Link>
          )
          
        })}
      </ul>
    </nav>
  );
}
