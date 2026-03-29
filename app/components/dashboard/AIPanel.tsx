"use client";

import { useState } from "react";
import { Send, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

type AIPanelProps = {
  onSubmit: (prompt: string) => void;
  response: string;
  loading: boolean;
  stats?: {
    totalRevenue: number;
    totalBookings: number;
    pending: number;
    confirmed: number;
  };
};

export default function AIPanel({
  onSubmit,
  response,
  loading,
  stats,
}: AIPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">AI Intelligence</h2>
        </div>
        <p className="text-sm text-gray-400">
          Real-time business insights powered by AI. Ask about performance, trends, or forecasts.
        </p>
      </div>

      {/* Quick Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="text-lg font-semibold text-emerald-300">
              {(stats.totalRevenue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-400">Bookings</p>
            <p className="text-lg font-semibold text-cyan-300">
              {stats.totalBookings}
            </p>
          </div>
          <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-400">Pending</p>
            <p className="text-lg font-semibold text-amber-300">
              {stats.pending}
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-gray-400">Confirmed</p>
            <p className="text-lg font-semibold text-green-300">
              {stats.confirmed}
            </p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about revenue trends, booking patterns, risks..."
          rows={3}
          className="w-full bg-gray-900/50 border border-emerald-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 resize-none backdrop-blur-sm transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send size={16} />
              Get Insights
            </>
          )}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-cyan-500/0 rounded-lg blur opacity-50" />
            <div className="relative bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                {response}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-4 backdrop-blur-sm flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-amber-300">AI Disclaimer</p>
          <p className="text-xs text-gray-400 mt-1">
            Insights are based on current data. Always verify with actual records.
          </p>
        </div>
      </div>
    </div>
  );
}
