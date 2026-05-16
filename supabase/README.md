# Supabase setup

## One-time

1. Install CLI: `brew install supabase/tap/supabase`
2. Create a Supabase project at https://app.supabase.com
3. Link: `supabase link --project-ref <your-project-ref>`
4. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL` — Project URL from Settings → API
   - `VITE_SUPABASE_ANON_KEY` — anon public key
   - `VITE_RAZORPAY_KEY_ID` — Razorpay test mode key_id

## Apply schema

```bash
supabase db push          # apply 0001..0005
# Or against a local stack: supabase start && supabase db reset
```

## Edge function secrets

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx
supabase secrets set RAZORPAY_KEY_SECRET=xxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxx
# Stubbed services (any non-empty value to silence warnings)
supabase secrets set SHIPROCKET_EMAIL=stub
supabase secrets set SHIPROCKET_PASSWORD=stub
supabase secrets set MSG91_AUTH_KEY=stub
supabase secrets set MSG91_TEMPLATE_ID=stub
supabase secrets set INTERAKT_API_KEY=stub
supabase secrets set RESEND_API_KEY=stub
```

## Deploy functions

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy refund-payment
supabase functions deploy create-cod-order
supabase functions deploy validate-discount
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy check-pincode-serviceability
supabase functions deploy create-shiprocket-order
supabase functions deploy get-shipment-tracking
supabase functions deploy create-return-pickup
supabase functions deploy send-email
supabase functions deploy send-whatsapp-update
```

Then register the Razorpay webhook URL (Settings → Webhooks):

```
https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
```

Subscribe to events: `payment.captured`, `payment.failed`, `refund.processed`.
