"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LivePulse from "@/app/components/dashboard/LivePulse";

type ControlRoomShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/control-room/overview-v1" },
  { label: "Forecast", href: "/control-room" },
  { label: "Bokun", href: "/control-room/bokun" },
  { label: "Air Arrivals", href: "/control-room/air-arrivals" },
  { label: "Capacity", href: "/control-room/capacity" },
  { label: "Orders", href: "/control-room/orders" },
  { label: "Settings", href: "/control-room/settings" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/control-room") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ControlRoomShell({ children }: ControlRoomShellProps) {
  const pathname = usePathname() ?? "";

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Control Room
            </h1>
            <LivePulse active={true} color="emerald" />
          </div>
          <p className="text-sm text-gray-400">Víkingaheimar operational dashboard</p>
        </header>

        <nav className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/60 backdrop-blur-xl p-2 overflow-x-auto">
          <ul className="flex items-center gap-2 min-w-max">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
                        : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section>{children}</section>
      </div>
    </main>
  );
}
