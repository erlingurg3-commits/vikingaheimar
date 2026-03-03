"use client";

export default function ControlRoomHeader() {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
          Control Room
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-300">Live</span>
        </div>
      </div>

      <p className="text-sm text-gray-400">The Watchtower - where the magic happens</p>
    </header>
  );
}
