"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "@/app/components/primitives/SkipLink";
// First-party analytics (Phase 2, 2026-08-27). Mounted on the public branch
// only — the control-room / revenue early return above must stay untracked so
// internal dashboard use is never counted as visitor traffic.
import PageViewTracker from "@/app/components/analytics/PageViewTracker";
import { SkipLinkId } from "@/lib/accessibility";

interface SiteLayoutProps {
  children: React.ReactNode;
  todayHoursLabel: string;
}

export default function SiteLayout({ children, todayHoursLabel }: SiteLayoutProps) {
  const pathname = usePathname() ?? "";
  const isControlRoom = pathname === "/control-room" || pathname.startsWith("/control-room/");
  const isRevenue = pathname === "/revenue" || pathname.startsWith("/revenue/");
  const isHome = pathname === "/";

  if (isControlRoom || isRevenue) {
    return <>{children}</>;
  }

  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <PageViewTracker />
      <Header />

      {/* Main content area */}
      <main id={SkipLinkId} className={`isolate ${isHome ? "pt-0" : "pt-16"} min-h-screen`}>
        {children}
      </main>

      <Footer todayHoursLabel={todayHoursLabel} />
    </>
  );
}
