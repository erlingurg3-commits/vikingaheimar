"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEvents = pathname.startsWith("/groups/events");

  return (
    <>
      {/* ── Tab navigation ── */}
      <nav
        style={{
          background: "#0a0a0a",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 60px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <TabLink href="/groups" active={!isEvents}>
          Groups
        </TabLink>
        <TabLink href="/groups/events" active={isEvents}>
          Events
        </TabLink>
      </nav>

      {children}
    </>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "48px",
        padding: "0 24px 0 0",
        marginRight: "24px",
        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize: "11px",
        fontWeight: 400,
        letterSpacing: "0.18em",
        textTransform: "uppercase" as const,
        color: active ? "#c9b07a" : "rgba(232,226,217,0.35)",
        textDecoration: "none",
        borderBottom: active
          ? "0.5px solid #c9b07a"
          : "0.5px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(232,226,217,0.7)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.color =
            "rgba(232,226,217,0.35)";
        }
      }}
    >
      {children}
    </Link>
  );
}
