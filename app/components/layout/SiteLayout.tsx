"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import SkipLink from "@/app/components/primitives/SkipLink";
import { SkipLinkId } from "@/lib/accessibility";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname() ?? "";
  const isControlRoom = pathname === "/control-room" || pathname.startsWith("/control-room/");
  const isHome = pathname === "/";

  if (isControlRoom) {
    return <>{children}</>;
  }

  return (
    <>
      <SkipLink />
      <ScrollProgress />
      <Header />

      {/* Main content area */}
      <main id={SkipLinkId} className={`isolate ${isHome ? "pt-0" : "pt-20"} min-h-screen`}>
        {children}
      </main>

      <Footer />
    </>
  );
}
