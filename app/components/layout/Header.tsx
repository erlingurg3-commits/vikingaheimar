"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Button from "@/app/components/primitives/Button";
import Container from "@/app/components/primitives/Container";
import {
  DESKTOP_CTAS,
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
      setScrolled(window.scrollY > 18);
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
  const useTransparentHeader = false;

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
        className={`fixed top-0 left-0 right-0 z-[1030] transition-all duration-500 motion-reduce:transition-none ${
          useTransparentHeader
            ? "bg-transparent"
            : "bg-neutral-950/88 backdrop-blur-xl border-b border-accent-frost-blue/15 shadow-xl shadow-black/25"
        }`}
      >
        <Container size="xl" className="h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-base md:text-lg font-bold tracking-[0.2em] text-off-white hover:text-accent-frost-blue transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-frost-blue rounded-sm"
          >
            VÍKINGAHEIMAR
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-xs tracking-[0.22em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-frost-blue rounded-sm ${
                    active
                      ? "text-accent-frost-blue"
                      : "text-off-white/90 hover:text-off-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-accent-frost-blue transition-all duration-300 motion-reduce:transition-none ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/control-room"
              className="inline-flex items-center rounded-md border border-accent-frost-blue/30 px-3 py-2 text-[11px] tracking-[0.16em] uppercase text-off-white/90 hover:text-off-white hover:border-accent-frost-blue/60 transition-colors"
            >
              Control Room
            </Link>
            <Link href={DESKTOP_CTAS[1].href}>
              <Button variant="secondary" size="sm">
                {DESKTOP_CTAS[1].label}
              </Button>
            </Link>
            {!isTicketsPage &&
              (bookingLink.isExternal ? (
                <a
                  href={bookingLink.href}
                  target={bookingLink.target}
                  rel={bookingLink.rel}
                  onClick={() =>
                    trackBookTicketsClick({ source: "header_desktop", destination: "external" })
                  }
                >
                  <Button variant="primary" size="sm">
                    {DESKTOP_CTAS[0].label}
                  </Button>
                </a>
              ) : (
                <Link
                  href={bookingLink.href}
                  onClick={() =>
                    trackBookTicketsClick({ source: "header_desktop", destination: "internal" })
                  }
                >
                  <Button variant="primary" size="sm">
                    {DESKTOP_CTAS[0].label}
                  </Button>
                </Link>
              ))}
          </div>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md text-off-white hover:bg-neutral-800/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-frost-blue"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-overlay"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Container>
      </header>

      <div
        ref={mobileOverlayRef}
        id="mobile-navigation-overlay"
        className={`md:hidden fixed inset-0 z-[1025] bg-base-near-black/95 backdrop-blur-xl transition-all duration-500 motion-reduce:transition-none ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <Container size="xl" className="h-full py-7 flex flex-col">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-base font-bold tracking-[0.2em] text-off-white"
              onClick={closeMenu}
            >
              VÍKINGAHEIMAR
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-off-white hover:bg-neutral-800/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-frost-blue"
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
                >
                  <Button variant="primary" size="sm" fullWidth>
                    {MOBILE_QUICK_CTAS[0].label}
                  </Button>
                </a>
              ) : (
                <Link
                  href={bookingLink.href}
                  onClick={() => {
                    trackBookTicketsClick({ source: "header_mobile", destination: "internal" });
                    closeMenu();
                  }}
                >
                  <Button variant="primary" size="sm" fullWidth>
                    {MOBILE_QUICK_CTAS[0].label}
                  </Button>
                </Link>
              ))}
            <Link href={MOBILE_QUICK_CTAS[1].href} onClick={closeMenu}>
              <Button variant="secondary" size="sm" fullWidth>
                {MOBILE_QUICK_CTAS[1].label}
              </Button>
            </Link>
            <Link href={MOBILE_QUICK_CTAS[2].href} onClick={closeMenu}>
              <Button variant="ghost" size="sm" fullWidth>
                {MOBILE_QUICK_CTAS[2].label}
              </Button>
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
                  className={`font-display text-4xl leading-tight transition-all duration-500 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-frost-blue rounded-sm ${
                    active
                      ? "text-accent-frost-blue"
                      : "text-off-white hover:text-accent-ice-white"
                  } ${
                    mobileMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 35}ms` }}
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
