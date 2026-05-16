// Stub: logs WhatsApp template payloads. Real Interakt integration commented.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const body = await req.json();
  console.log("[send-whatsapp-update] STUB", body);
  // TODO: real Interakt call
  return json({ ok: true });
});
