"use client";

import Link from "next/link";
import Container from "@/app/components/primitives/Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#0d0c0a" }}>
      {/* Subtle top rule */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

      {/* Main Footer Content */}
      <Container size="xl" className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-20 text-center md:text-center">
          <div className="space-y-5 mx-auto">
            <h3
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                marginBottom: 20,
              }}
            >
              Víkingaheimar
            </h3>
            <p className="text-sm leading-relaxed max-w-[28ch]" style={{ color: "rgba(255,255,255,0.40)" }}>
              A cultural institution preserving authentic Viking heritage in Iceland.
            </p>
          </div>

          <div className="space-y-5 mx-auto">
            <h4
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                marginBottom: 20,
              }}
            >
              Location
            </h4>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.40)" }}>
              <p>Víkingabraut 1, 260 Reykjanesbær, Iceland</p>
              <p>
                <a href="tel:+3544266699" style={{ color: "rgba(255,255,255,0.40)", transition: "color 250ms" }}>
                  +354 426 6699
                </a>
              </p>
              <p>
                <a href="mailto:info@vikingaheimar.is" style={{ color: "rgba(255,255,255,0.40)", transition: "color 250ms" }}>
                  info@vikingaheimar.is
                </a>
              </p>
              <p>Open daily 10:00–18:00</p>
            </div>
          </div>

          <div className="space-y-5 mx-auto">
            <h4
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                marginBottom: 20,
              }}
            >
              Explore
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
              <li>
                <Link href="/tickets" style={{ color: "rgba(255,255,255,0.40)", transition: "color 250ms" }}>
                  Tickets
                </Link>
              </li>
              <li>
                <Link href="/groups" style={{ color: "rgba(255,255,255,0.40)", transition: "color 250ms" }}>
                  Groups
                </Link>
              </li>
              <li>
                <a href="#" style={{ color: "rgba(255,255,255,0.40)", transition: "color 250ms" }}>
                  Press
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Footer Bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Container size="xl" className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
              &copy; {currentYear} Víkingaheimar. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-6 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
              <a href="#" style={{ color: "rgba(255,255,255,0.30)", transition: "color 250ms" }}>
                Privacy Policy
              </a>
              <a href="#" style={{ color: "rgba(255,255,255,0.30)", transition: "color 250ms" }}>
                Terms of Service
              </a>
              <a href="#" style={{ color: "rgba(255,255,255,0.30)", transition: "color 250ms" }}>
                Cookie Policy
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
