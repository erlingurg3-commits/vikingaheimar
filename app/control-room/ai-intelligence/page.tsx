"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ControlRoomAiIntelligencePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages([...next, { role: "assistant", content: data.response }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-zinc-100">
            Control Intelligence
          </span>
          <span className="text-xs text-zinc-500">
            Read-only operational analysis — gpt-4o-mini
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-zinc-400">Live feed</span>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="mt-8 space-y-3 text-zinc-500 text-sm">
            <p className="text-zinc-400 font-medium">Ready.</p>
            <p>Operational context loaded. You may query:</p>
            <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
              <li>Demand forecast — next HIGH alert days, scores, contributing variables</li>
              <li>Orders — recent bookings, revenue, status breakdown</li>
              <li>Group requests — pending reviews, upcoming travel dates</li>
              <li>Scoring logic — formula components and thresholds</li>
            </ul>
            <p className="text-xs text-zinc-600 pt-2">
              No speculation. No estimates. Facts only.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-cyan-900/30 border border-cyan-500/20 text-zinc-100"
                  : "bg-zinc-900/60 border border-white/5 text-zinc-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-2">
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-white/5 px-4 py-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Query the operational feed…"
          rows={2}
          className="flex-1 resize-none bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 p-2.5 rounded-xl bg-cyan-700/30 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

