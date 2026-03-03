"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/control-room" },
  { label: "Capacity", href: "/control-room/capacity" },
  { label: "Group Requests", href: "/control-room/group-requests" },
  { label: "Travel Agent KPIs", href: "/control-room/agents" },
  { label: "Travel Agencies", href: "/control-room/travel-agencies" },
  { label: "Website Behavior", href: "/control-room/behavior" },
  { label: "Forecasts", href: "/control-room/forecasts" },
  { label: "AI Intelligence", href: "/control-room/ai" },
  { label: "Cruise Intelligence", href: "/admin/cruise-intelligence" },
  { label: "Settings", href: "/control-room/settings" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/control-room") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNavBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="sticky top-3 z-20 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/50 to-black/70 backdrop-blur-xl p-2 overflow-x-auto">
      <ul className="flex items-center gap-2 min-w-max">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-emerald-200 brightness-110"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                <span
                  className={`pointer-events-none absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full transition-all duration-200 ${
                    active ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" : "bg-transparent"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
