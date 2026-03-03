"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SailingShip from "./SailingShip";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [shipHovered, setShipHovered] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        
        {/* Logo */}
        <div className="font-bold tracking-[0.3em] text-sm uppercase">
          VÍKINGAHEIMAR
        </div>

        {/* Desktop Navigation */}
        <div className="space-x-10 hidden md:flex text-sm tracking-widest uppercase">

          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setShipHovered("hall")}
            onMouseLeave={() => setShipHovered(null)}
          >
            <Link href="/#hall" className="relative block">
              Hall
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
            {shipHovered === "hall" && (
              <div className="absolute left-1/2 transform -translate-x-1/2 w-full h-32 pointer-events-none">
                <SailingShip />
              </div>
            )}
          </div>

          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setShipHovered("tickets")}
            onMouseLeave={() => setShipHovered(null)}
          >
            <Link href="/tickets" className="relative block">
              Tickets
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
            {shipHovered === "tickets" && (
              <div className="absolute left-1/2 transform -translate-x-1/2 w-full h-32 pointer-events-none">
                <SailingShip />
              </div>
            )}
          </div>

          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setShipHovered("groups")}
            onMouseLeave={() => setShipHovered(null)}
          >
            <Link href="/groups" className="relative block">
              Groups
              <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
            {shipHovered === "groups" && (
              <div className="absolute left-1/2 transform -translate-x-1/2 w-full h-32 pointer-events-none">
                <SailingShip />
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
