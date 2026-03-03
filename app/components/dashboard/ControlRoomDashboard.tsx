"use client";

import { useState } from "react";
import { Zap, Users, CheckCircle, Clock } from "lucide-react";
import MetricCard from "@/app/components/dashboard/MetricCard";
import OrdersFeed from "@/app/components/dashboard/OrdersFeed";
import AIPanel from "@/app/components/dashboard/AIPanel";
import NextHighDaySignalCard from "@/app/components/dashboard/NextHighDaySignalCard";
import { useControlRoomOrders } from "@/app/components/dashboard/useControlRoomOrders";

export default function ControlRoomDashboard() {
  const { orders, loading, stats } = useControlRoomOrders();
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const revenueTrend = stats.totalRevenue > 0 ? 12 : 0;
  const bookingsTrend = stats.totalOrders > 0 ? 8 : 0;

  const handleAI = async (prompt: string) => {
    setAiLoading(true);
    setAiResponse("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        stats: {
          totalRevenue: stats.totalRevenue,
          totalBookings: stats.totalOrders,
          pending: stats.pending,
          confirmed: stats.confirmed,
        },
      }),
    });

    const data = await response.json();
    setAiResponse(data.response ?? "");
    setAiLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-1 space-y-4">
        <MetricCard
          title="Total Revenue"
          value={`ISK ${(stats.totalRevenue / 1000).toFixed(1)}K`}
          change={revenueTrend}
          trend="up"
          icon={<Zap size={20} />}
          subtitle="This period"
        />

        <MetricCard
          title="Total Bookings"
          value={stats.totalOrders}
          change={bookingsTrend}
          trend="up"
          icon={<Users size={20} />}
          subtitle="Active orders"
        />

        <MetricCard
          title="Confirmed"
          value={stats.confirmed}
          icon={<CheckCircle size={20} />}
          subtitle={`${((stats.confirmed / stats.totalOrders) * 100 || 0).toFixed(0)}% of total`}
        />

        <MetricCard
          title="Pending"
          value={stats.pending}
          icon={<Clock size={20} />}
          subtitle="Awaiting confirmation"
        />
      </div>

      <div className="lg:col-span-1">
        <OrdersFeed orders={orders} loading={loading} />
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-4">
          <NextHighDaySignalCard />

          <div className="bg-gradient-to-br from-gray-900/40 to-black/70 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <AIPanel
              onSubmit={handleAI}
              response={aiResponse}
              loading={aiLoading}
              stats={{
                totalRevenue: stats.totalRevenue,
                totalBookings: stats.totalOrders,
                pending: stats.pending,
                confirmed: stats.confirmed,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
