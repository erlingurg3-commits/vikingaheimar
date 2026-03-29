"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo Left */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/Vikingaheimar-02.png"
            alt="Víkingaheimar"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation Center */}
        <div className="hidden md:flex items-center gap-12 text-sm font-medium text-neutral-700">
          <Link href="/#hall" className="hover:text-neutral-900 transition-colors">
            Experience
          </Link>
          <Link href="/booking" className="hover:text-neutral-900 transition-colors">
            Plan Visit
          </Link>
          <Link href="/tickets" className="hover:text-neutral-900 transition-colors">
            Tickets
          </Link>
          <Link href="/groups" className="hover:text-neutral-900 transition-colors">
            Groups
          </Link>
          <Link href="/about" className="hover:text-neutral-900 transition-colors">
            About
          </Link>
        </div>

        {/* Right Side: Language + Menu */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <button className="px-2 py-1 text-neutral-600 hover:text-neutral-900">
              EN
            </button>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            Menu
          </button>

          <Link
            href="/control-room"
            className="hidden md:inline-flex text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ADMIN
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-4 space-y-3">
          <Link href="/#hall" className="block text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Experience
          </Link>
          <Link href="/booking" className="block text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Plan Visit
          </Link>
          <Link href="/tickets" className="block text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Tickets
          </Link>
          <Link href="/groups" className="block text-sm font-medium text-neutral-700 hover:text-neutral-900">
            Groups
          </Link>
          <Link href="/about" className="block text-sm font-medium text-neutral-700 hover:text-neutral-900">
            About
          </Link>
        </div>
      )}
    </nav>
  );
}
