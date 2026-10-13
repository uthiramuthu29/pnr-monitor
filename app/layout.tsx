import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus",
});

export const metadata: Metadata = {
  title: "PNR Monitor - Live IRCTC PNR Status & Alerts",
  description: "Track Indian Railways PNR status, chart preparation, RAC movement, and get automated alerts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} min-h-screen antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#FAF8FF]">
        <Header />
        <main className="p-4 flex-1 pb-20 relative max-w-lg mx-auto w-full">{children}</main>
        <Navbar />
      </body>
    </html>
  );
}
