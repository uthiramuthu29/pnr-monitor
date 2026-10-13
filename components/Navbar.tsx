"use client";

import { House, Ticket, Users, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  type navLinksType = {
    id: number;
    name: string;
    icon: LucideIcon;
    link: string;
  };

  const navLinks: navLinksType[] = [
    { id: 1, name: "Home", icon: House, link: "/" },
    { id: 2, name: "PNRs", icon: Ticket, link: "/pnrs" },
    { id: 3, name: "Recipients", icon: Users, link: "/recipients" },
    { id: 4, name: "Settings", icon: Settings, link: "/settings" },
  ];

  return (
    <nav className="fixed z-40 bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-md">
      <div className="max-w-lg mx-auto">
        <ul className="flex justify-around px-2 py-2">
          {navLinks.map((navLink: navLinksType) => {
            const Icon = navLink.icon;
            const isActive = pathname === navLink.link;

            return (
              <li key={navLink.id}>
                <Link
                  href={navLink.link}
                  className={`flex flex-col items-center gap-0.5 text-[11px] leading-3.5 font-bold font-inter px-3 py-1 rounded-xl transition-colors ${
                    isActive
                      ? "text-[#0058BE]"
                      : "text-blackish-ash hover:text-navy-dark"
                  }`}
                >
                  <Icon size={20} />
                  <span>{navLink.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
