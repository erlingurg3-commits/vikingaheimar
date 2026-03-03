import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
})();

let cachedAdminClient: SupabaseClient | null = null;

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin Supabase client");
  }
  return key;
}

function getAdminClient() {
  const adminKey = getServiceRoleKey();

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, adminKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return cachedAdminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getAdminClient();
    const value = Reflect.get(client, property, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
