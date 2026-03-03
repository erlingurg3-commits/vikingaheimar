"use client";

import ControlRoomHeader from "@/app/components/admin/ControlRoomHeader";
import AdminNavBar from "@/app/components/admin/AdminNavBar";

type ControlRoomLayoutProps = {
  children: React.ReactNode;
};

export default function ControlRoomLayout({ children }: ControlRoomLayoutProps) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        <ControlRoomHeader />
        <AdminNavBar />

        <section>{children}</section>
      </div>
    </main>
  );
}
