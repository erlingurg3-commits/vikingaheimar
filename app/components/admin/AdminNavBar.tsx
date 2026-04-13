"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { label: string; href: string; external?: boolean }[] = [
  { label: "Dashboard", href: "/control-room/overview-v1" },
  { label: "Revenue Forecast", href: "/control-room" },
  { label: "Revenue dashboard", href: "/revenue" },
  { label: "Capacity", href: "/control-room/capacity" },
  { label: "Group Requests", href: "/control-room/group-requests" },
  { label: "Travel Agent KPIs", href: "/control-room/agents" },
  { label: "Website Behavior", href: "/control-room/behavior" },
  { label: "Cruise Intelligence", href: "/admin/cruise-intelligence" },
  { label: "Air Arrivals", href: "/control-room/air-arrivals" },
  { label: "Group Bookings", href: "/control-room.html", external: true },
  { label: "Tourism Intelligence", href: "/control-room-v2" },
];

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
          const classes = `relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
            active
              ? "text-emerald-200 brightness-110"
              : "text-gray-300 hover:text-white hover:bg-white/5"
          }`;

          const underline = (
            <span
              className={`pointer-events-none absolute left-2 right-2 -bottom-[2px] h-[2px] rounded-full transition-all duration-200 ${
                active ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" : "bg-transparent"
              }`}
              aria-hidden="true"
            />
          );

          return (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {item.label}
                  <span className="ml-1 text-[10px] opacity-50">↗</span>
                  {underline}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className={classes}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {underline}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
