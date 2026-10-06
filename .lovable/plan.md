# CLASSIE Build Plan

This is a very large scope (20+ routes, 20+ DB tables, 15+ edge functions, 5 third-party integrations). I'll build it in clearly bounded phases so each is reviewable in the preview before moving on. Each phase ends in a working, testable state.

## Phase 0 — Foundation (this turn)

- Install Cormorant Garamond + Inter via Google Fonts
- Wire design tokens into `src/styles.css` (cream-bg, ink, burgundy, stone, etc.) as Tailwind theme tokens
- Build shared chrome: `AnnouncementBar`, `MainNav`, `Footer`
- Apply chrome via a layout route wrapping all storefront pages
- Build the **Homepage** in full (hero, marquee, Style Studio teaser, collection grid with placeholder products, editorial journal, community grid)
- Add route stubs for everything else so nav links don't 404

Deliverable: a polished homepage matching the spec's editorial-minimalist aesthetic, with the design system locked in.

## Phase 1 — Catalog (next turn)

- Collection page (`/collections/:slug`) with filter/sort bar, product grid, "Why Classie" band
- Product detail page (`/products/:slug`) with gallery, variant selectors, pincode check (stubbed), accordions, reviews section (static), related rails
- Hard-coded product catalog (JSON) so we can design against real data before DB is wired

## Phase 2 — Signature features

- Style Studio (`/style-studio`) — 3-column workspace, sticky bottom bar, share-link state
- Style Quiz (`/style-quiz`) — 4 questions, results screen, email capture

## Phase 3 — Commerce flow (frontend-only first)

- Cart (Zustand persisted to localStorage)
- Checkout (progressive 3-section)
- Order confirmation
- Track order

## Phase 4 — Lovable Cloud + Auth

- Enable Lovable Cloud (Supabase)
- Schema migration for all tables in the spec
- RLS policies + `has_role` security-definer function + `app_role` enum
- Storage buckets (`product-images`, `composite-previews`, `review-photos`, `user-uploads`, `brand-assets`)
- Auth pages (`/auth/login`, `/auth/register`) with email + Google
- Replace JSON catalog with live queries via server functions
- Customer account routes (`/account/*`)

## Phase 5 — Admin

- Admin dashboard, orders, products, collections, customers, discounts, returns, reviews, quiz matrix, settings
- Role-protected via `_authenticated/_admin` layout

## Phase 6 — Integrations (edge functions / server fns + secrets)

- Razorpay (create order, verify payment, webhook, refund)
- MSG91 (send/verify OTP for COD + phone auth)
- Shiprocket (pincode, create order, tracking, returns)
- Interakt (WhatsApp templates)
- Resend (transactional email)
- Postgres triggers / scheduled jobs for order lifecycle + abandoned cart

Each integration requires the user to add API keys via the secrets tool; I'll request them at the start of Phase 6.

## Technical notes

- Stack stays TanStack Start (template default), **not** the React+Vite+React Router DOM the brief mentions. The Lovable template is TanStack Start; rewriting to plain Vite+RR would break SSR/server-fn capabilities.
- Backend = **Lovable Cloud** (built on Supabase). I'll refer to it as Lovable Cloud in chat per platform conventions, but the schema/RLS work is exactly as specified.
- Edge functions: I'll implement business logic as TanStack `createServerFn` handlers (the platform-preferred pattern) rather than Supabase Edge Functions, except for webhook receivers which go under `/api/public/*`. Functionally equivalent, better DX, secrets still server-side.
- Money stored as integer paise everywhere.
- Composite previews for Style Studio = pre-rendered PNG layers in storage (no realtime compositing), as specified.

## What I need from you to start Phase 6 later

- Razorpay key id + secret + webhook secret
- MSG91 auth key + sender id + OTP template id
- Shiprocket email + password (or token) + channel id
- Interakt API key + template names approved
- Resend API key + verified sending domain

---

**To start now, I'll execute Phase 0 only.** That gets you a real homepage you can react to, and lets us refine the design system before the rest of the site inherits it. Approve and I'll begin.
