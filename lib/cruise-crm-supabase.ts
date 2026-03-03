"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export function getCruiseCrmSupabaseClient() {
  return supabaseBrowser;
}
