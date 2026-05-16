// Stub: returns deliverable=true for any 6-digit pincode.
// Real Shiprocket: POST https://apiv2.shiprocket.in/v1/external/courier/serviceability/

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { json, preflight } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  const { pincode } = await req.json();
  if (!/^\d{6}$/.test(pincode ?? "")) return json({ error: "Invalid pincode" }, 400);
  // TODO: real Shiprocket call
  return json({
    ok: true,
    deliverable: true,
    days: 4,
    cod_supported: true,
    city: "Mumbai",
    state: "Maharashtra",
  });
});
