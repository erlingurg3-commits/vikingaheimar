"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Container from "@/app/components/primitives/Container";

const NAV_ITEMS = [
  { label: "The Saga", href: "/saga" },
  { label: "Visit", href: "/visit" },
  { label: "Provisions", href: "/provisions" },
] as const;

export default function Header() {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const isHomepage = pathname === "/";
  const isTransparent = isHomepage && !scrolled;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[1030]"
        style={{
          background: isTransparent ? "transparent" : "#f5f3ee",
          borderBottom: isTransparent ? "none" : "1px solid #e2ddd7",
          boxShadow: isTransparent ? "none" : "0 1px 24px rgba(0,0,0,0.06)",
          transition: "background 600ms ease, border-color 600ms ease, box-shadow 600ms ease",
        }}
      >
        <Container size="xl" className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-display focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: isTransparent ? "#ffffff" : "#1a1a1a",
              transition: "color 600ms ease",
            }}
          >
            V&Iacute;KINGAHEIMAR
          </Link>

          {/* Desktop nav — center */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-text relative focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: isTransparent
                      ? active ? "#ffffff" : "rgba(255,255,255,0.75)"
                      : active ? "#1a1a1a" : "#7a7672",
                    transition: "color 600ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isTransparent ? "#ffffff" : "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    if (active) return;
                    e.currentTarget.style.color = isTransparent ? "rgba(255,255,255,0.75)" : "#7a7672";
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  <span
                    style={{
                      position: "absolute",
                      bottom: -8,
                      left: 0,
                      height: 2,
                      width: active ? "100%" : "0%",
                      background: isTransparent ? "#ffffff" : "#4ea8de",
                      boxShadow: active ? "0 2px 8px rgba(78,168,222,0.40)" : "none",
                      transition: "width 300ms ease, background 600ms ease",
                    }}
                  />
                </Link>
              );
            })}

            {/* Book Your Raid — CTA style */}
            <Link
              href="/booking"
              className="font-text focus-visible:outline-2 focus-visible:outline-offset-4 rounded-sm"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: 2,
                background: isTransparent ? "rgba(78,168,222,0.15)" : "rgba(78,168,222,0.08)",
                border: isTransparent
                  ? "1px solid rgba(78,168,222,0.30)"
                  : "1px solid rgba(78,168,222,0.25)",
                color: isTransparent ? "rgba(78,168,222,0.95)" : "#4ea8de",
                transition: "all 400ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isTransparent
                  ? "rgba(78,168,222,0.25)"
                  : "rgba(78,168,222,0.14)";
                e.currentTarget.style.borderColor = "#4ea8de";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isTransparent
                  ? "rgba(78,168,222,0.15)"
                  : "rgba(78,168,222,0.08)";
                e.currentTarget.style.borderColor = isTransparent
                  ? "rgba(78,168,222,0.30)"
                  : "rgba(78,168,222,0.25)";
              }}
            >
              Book Your Raid
            </Link>
          </nav>

          {/* Right side — Control Room + mobile hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/control-room"
              className="font-text hidden md:inline-flex"
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: 2,
                background: isTransparent ? "rgba(255,255,255,0.10)" : "transparent",
                border: isTransparent ? "1px solid rgba(255,255,255,0.20)" : "1px solid #e2ddd7",
                color: isTransparent ? "rgba(255,255,255,0.80)" : "#7a7672",
                transition: "all 400ms ease",
              }}
              onMouseEnter={(e) => {
                if (isTransparent) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                } else {
                  e.currentTarget.style.borderColor = "#c8874a";
                  e.currentTarget.style.color = "#c8874a";
                }
              }}
              onMouseLeave={(e) => {
                if (isTransparent) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                } else {
                  e.currentTarget.style.borderColor = "#e2ddd7";
                  e.currentTarget.style.color = "#7a7672";
                }
              }}
            >
              Control Room
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                color: isTransparent ? "#ffffff" : "#1a1a1a",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-overlay"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-navigation-overlay"
        className={`lg:hidden fixed inset-0 z-[1040] bg-[#f5f3ee] transition-all duration-500 motion-reduce:transition-none ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <Container size="xl" className="h-full py-7 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-display"
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "#1a1a1a",
              }}
              onClick={closeMenu}
            >
              V&Iacute;KINGAHEIMAR
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ color: "#1a1a1a", background: "transparent", border: "none", cursor: "pointer" }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav aria-label="Mobile primary" className="mt-12 flex flex-col gap-6">
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`font-display text-4xl leading-tight transition-all duration-500 motion-reduce:transition-none rounded-sm ${
                    mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{
                    transitionDelay: `${index * 35}ms`,
                    textDecoration: "none",
                    color: active ? "#1a1a1a" : "#7a7672",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTA */}
          <Link
            href="/booking"
            onClick={closeMenu}
            className={`mt-8 inline-flex items-center justify-center rounded-md font-text transition-all duration-500 ${
              mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: `${NAV_ITEMS.length * 35}ms`,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "16px 32px",
              background: "#4ea8de",
              color: "#ffffff",
              border: "none",
            }}
          >
            Book Your Raid
          </Link>

          {/* Mobile Control Room link */}
          <Link
            href="/control-room"
            onClick={closeMenu}
            className={`mt-4 inline-flex items-center justify-center rounded-md font-text transition-all duration-500 ${
              mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: `${(NAV_ITEMS.length + 1) * 35}ms`,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "12px 24px",
              background: "transparent",
              color: "#7a7672",
              border: "1px solid #e2ddd7",
            }}
          >
            Control Room
          </Link>
        </Container>
      </div>
    </>
  );
}
