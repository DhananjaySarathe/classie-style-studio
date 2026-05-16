import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let _client: SupabaseClient<Database> | null = null;
let _warned = false;

function makeStubClient(): SupabaseClient<Database> {
  // Allow the app to render without crashing when env vars are missing.
  // Any actual call throws so failures surface immediately.
  const handler: ProxyHandler<object> = {
    get(_t, prop) {
      if (prop === "then") return undefined;
      return () => {
        throw new Error(
          "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local",
        );
      };
    },
  };
  return new Proxy({}, handler) as unknown as SupabaseClient<Database>;
}

export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;
  if (!url || !anonKey) {
    if (!_warned && typeof window !== "undefined") {
      console.warn(
        "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — using stub client.",
      );
      _warned = true;
    }
    _client = makeStubClient();
    return _client;
  }
  _client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

export const supabase = getSupabase();

export function hasSupabaseEnv(): boolean {
  return Boolean(url && anonKey);
}

export function getOrCreateGuestSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "classie.guest_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return "₹" + rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
