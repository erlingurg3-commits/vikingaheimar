"use client";

import Link from "next/link";
import Container from "@/app/components/primitives/Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t" style={{ backgroundColor: "#f7f6f2", borderColor: "#d4d0c8" }}>
      {/* Main Footer Content */}
      <Container size="xl" className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-20 text-center md:text-center">
          <div className="space-y-5 mx-auto">
            <h3 className="font-display text-lg font-semibold tracking-[0.12em] uppercase" style={{ color: "#111111" }}>
              Víkingaheimar
            </h3>
            <p className="text-sm leading-relaxed max-w-[28ch]" style={{ color: "#6b6b6b" }}>
              A cultural institution preserving authentic Viking heritage in Iceland.
            </p>
          </div>

          <div className="space-y-5 mx-auto">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "#111111" }}>
              Location
            </h4>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#6b6b6b" }}>
              <p>Víkingabraut 1, 260 Reykjanesbær, Iceland</p>
              <p>
                <a href="tel:+3544266699" className="transition-colors" style={{ color: "#6b6b6b" }}>
                  +354 426 6699
                </a>
              </p>
              <p>
                <a href="mailto:info@vikingaheimar.is" className="transition-colors" style={{ color: "#6b6b6b" }}>
                  info@vikingaheimar.is
                </a>
              </p>
              <p>Open daily 10:00–18:00</p>
            </div>
          </div>

          <div className="space-y-5 mx-auto">
            <h4 className="font-display text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "#111111" }}>
              Explore
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "#6b6b6b" }}>
              <li>
                <Link href="/tickets" className="transition-colors" style={{ color: "#6b6b6b" }}>
                  Tickets
                </Link>
              </li>
              <li>
                <Link href="/groups" className="transition-colors" style={{ color: "#6b6b6b" }}>
                  Groups
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors" style={{ color: "#6b6b6b" }}>
                  Press
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Footer Bottom */}
      <div className="border-t" style={{ borderColor: "#d4d0c8" }}>
        <Container size="xl" className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
            <p className="text-xs" style={{ color: "#6b6b6b" }}>
              &copy; {currentYear} Víkingaheimar. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-6 text-xs" style={{ color: "#6b6b6b" }}>
              <a href="#" className="transition-colors" style={{ color: "#6b6b6b" }}>
                Privacy Policy
              </a>
              <a href="#" className="transition-colors" style={{ color: "#6b6b6b" }}>
                Terms of Service
              </a>
              <a href="#" className="transition-colors" style={{ color: "#6b6b6b" }}>
                Cookie Policy
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
