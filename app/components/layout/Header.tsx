"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Container from "@/app/components/primitives/Container";
import {
  MOBILE_QUICK_CTAS,
  NAV_LINKS,
} from "./routes";
import { getBookTicketsLink } from "@/lib/ticketing";
import { trackBookTicketsClick } from "@/lib/analytics";

export default function Header() {
  const pathname = usePathname() ?? "";
  const bookingLink = getBookTicketsLink();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileOverlayRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen || !mobileOverlayRef.current) {
      return;
    }

    const overlay = mobileOverlayRef.current;
    const focusable = overlay.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    overlay.addEventListener("keydown", onKeyDown);

    return () => {
      overlay.removeEventListener("keydown", onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  const isTicketsPage = pathname === "/tickets" || pathname.startsWith("/tickets/");
  const isHomepage = pathname === "/";
  const isTransparent = isHomepage && !scrolled;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[1030]"
        style={{
          background: isTransparent ? "transparent" : "#f5f3ee",
          borderBottom: isTransparent ? "none" : "1px solid #e2ddd7",
          boxShadow: isTransparent ? "none" : "0 1px 24px rgba(0,0,0,0.06)",
          transition:
            "background 600ms ease, border-color 600ms ease, box-shadow 600ms ease",
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
            VÍKINGAHEIMAR
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((item) => {
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
                      ? active
                        ? "#ffffff"
                        : "rgba(255,255,255,0.75)"
                      : active
                        ? "#1a1a1a"
                        : "#7a7672",
                    transition: "color 600ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isTransparent
                      ? "#ffffff"
                      : "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    if (active) return;
                    e.currentTarget.style.color = isTransparent
                      ? "rgba(255,255,255,0.75)"
                      : "#7a7672";
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  <span
                    style={{
                      position: "absolute",
                      bottom: -8,
                      left: 0,
                      height: 1,
                      width: active ? "100%" : "0%",
                      background: isTransparent ? "#ffffff" : "#1a1a1a",
                      transition: "width 300ms ease, background 600ms ease",
                    }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Control Room buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/control-room"
              className="font-text"
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: 2,
                background: isTransparent
                  ? "rgba(255,255,255,0.10)"
                  : "transparent",
                border: isTransparent
                  ? "1px solid rgba(255,255,255,0.20)"
                  : "1px solid #e2ddd7",
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
          </div>

          {/* Mobile hamburger */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{
              color: isTransparent ? "#ffffff" : "#1a1a1a",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-overlay"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>
      </header>

      {/* Mobile overlay — always light background */}
      <div
        ref={mobileOverlayRef}
        id="mobile-navigation-overlay"
        className={`md:hidden fixed inset-0 z-[1025] bg-[#f5f3ee] backdrop-blur-md transition-all duration-500 motion-reduce:transition-none ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } [&_a]:!text-[#1a1a1a] [&_a:hover]:!text-[#1a1a1a] [&_a:visited]:!text-[#1a1a1a]`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <Container size="xl" className="h-full py-7 flex flex-col">
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
              VÍKINGAHEIMAR
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a]"
              style={{ color: "#1a1a1a", background: "transparent", border: "none", cursor: "pointer" }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className={`mt-8 grid gap-2 ${isTicketsPage ? "grid-cols-2" : "grid-cols-3"}`}>
            {!isTicketsPage &&
              (bookingLink.isExternal ? (
                <a
                  href={bookingLink.href}
                  target={bookingLink.target}
                  rel={bookingLink.rel}
                  onClick={() => {
                    trackBookTicketsClick({ source: "header_mobile", destination: "external" });
                    closeMenu();
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ece8df] px-3 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#e2ddd7]"
                >
                  {MOBILE_QUICK_CTAS[0].label}
                </a>
              ) : (
                <Link
                  href={bookingLink.href}
                  onClick={() => {
                    trackBookTicketsClick({ source: "header_mobile", destination: "internal" });
                    closeMenu();
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ece8df] px-3 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#e2ddd7]"
                >
                  {MOBILE_QUICK_CTAS[0].label}
                </Link>
              ))}
            <Link
              href={MOBILE_QUICK_CTAS[1].href}
              onClick={closeMenu}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ece8df] px-3 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#e2ddd7]"
            >
              {MOBILE_QUICK_CTAS[1].label}
            </Link>
            <Link
              href={MOBILE_QUICK_CTAS[2].href}
              onClick={closeMenu}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ece8df] px-3 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#e2ddd7]"
            >
              {MOBILE_QUICK_CTAS[2].label}
            </Link>
          </div>

          <nav aria-label="Mobile primary" className="mt-10 flex flex-col gap-5">
            {NAV_LINKS.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`font-display text-4xl leading-tight transition-all duration-500 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1a1a] rounded-sm ${
                    active ? "text-[#1a1a1a]" : "text-[#7a7672] hover:text-[#1a1a1a]"
                  } ${
                    mobileMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 35}ms`, textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>
    </>
  );
}
