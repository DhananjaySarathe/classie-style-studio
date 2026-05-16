// Stub: marks the return as approved and stores a fake pickup id.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const { return_id } = await req.json();
  if (!return_id) return json({ error: "Missing return_id" }, 400);

  const sb = serviceClient();
  await sb
    .from("returns")
    .update({
      status: "approved",
      shiprocket_pickup_id: "PICKUP" + Date.now(),
    })
    .eq("id", return_id);

  return json({ ok: true });
});
