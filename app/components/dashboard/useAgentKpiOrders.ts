"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { OrderRow } from "@/lib/orders";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type AgentDateRange = "7d" | "30d" | "all";

type UseAgentKpiOrdersOptions = {
  dateRange: AgentDateRange;
  includeClosedStatuses: boolean;
  includeGroupRequests: boolean;
};

const ORDER_FIELDS =
  "id,created_at,agent_company,agent_name,visit_date,visit_time,total_tickets,ticket_general,ticket_youth,ticket_family,group_size,request_type,admin_status,total_amount,status,source,source_type,source_id";

function getFromDate(range: AgentDateRange): string | null {
  if (range === "all") {
    return null;
  }

  const now = new Date();
  const days = range === "7d" ? 7 : 30;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

function getAllowedStatuses(includeClosedStatuses: boolean) {
  return includeClosedStatuses
    ? ["pending", "confirmed", "expired", "cancelled"]
    : ["pending", "confirmed"];
}

export function useAgentKpiOrders({
  dateRange,
  includeClosedStatuses,
  includeGroupRequests,
}: UseAgentKpiOrdersOptions) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const statuses = useMemo(
    () => getAllowedStatuses(includeClosedStatuses),
    [includeClosedStatuses]
  );

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabaseBrowser
      .from("orders")
      .select(ORDER_FIELDS)
      .not("agent_company", "is", null)
      .in("status", statuses)
      .order("created_at", { ascending: false });

    const fromDate = getFromDate(dateRange);
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setOrders([]);
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as OrderRow[];
    const normalized = includeGroupRequests
      ? rows
      : rows.filter(
          (row) =>
            (row.request_type ?? "standard") !== "group" &&
            (row.source ?? "") !== "travel_agent" &&
            (row.source_type ?? "standard") !== "group_request"
        );

    setOrders(normalized);
    setLoading(false);
  }, [dateRange, includeGroupRequests, statuses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadOrders]);

  useEffect(() => {
    refreshRef.current = loadOrders;
  }, [loadOrders]);

  useEffect(() => {
    if (channelRef.current) {
      return;
    }

    const channel = supabaseBrowser
      .channel("control-room-agents-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            const refresh = refreshRef.current;
            if (refresh) {
              refresh();
            }
          }, 300);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        supabaseBrowser.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    orders,
    loading,
    error,
  };
}
