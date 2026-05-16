// Stub: logs email payloads to console. Real Resend integration commented below.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const body = await req.json();
  console.log("[send-email] STUB", body);
  // TODO: real Resend call
  // await fetch("https://api.resend.com/emails", { method: "POST", headers: {...}, body: ... });
  return json({ ok: true });
});
