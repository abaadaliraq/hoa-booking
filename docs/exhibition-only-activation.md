# Exhibition-only booking activation — 2026-10-28

Scope: C:\HOA-SYSTEM\booking; Supabase pwlwelxnrrignapdsyiw only.

- Public page now opens the exhibition form directly. Ordinary visits, photography, restaurant and other booking choices are not offered. No payment form, $20 amount, free-price claim or price summary is shown. Existing tickets, opaque QR tokens and retry recovery are retained.
- Dates remain 2026-10-31 through 2026-11-09. Four one-hour windows per day: 17:00–18:00, 18:00–19:00, 19:00–20:00, 20:00–21:00, Baghdad time.
- User explicitly chose at most 60 visitors per hour and a shared maximum of 200 per day; not 240/day. Both API validation and existing database RPCs enforce capacity. Availability reflects the smaller of hourly and daily remaining places. Cancel/reschedule operations preserve the same shared lock and capacity rules.
- User explicitly approved production SQL and secret setup in Vercel. The SQL file was applied successfully as migration exhibition_shared_daily_capacity_200. Production verification: 40 open slots, hourly capacity 60, opening 17:00, closing 21:00, zero reservations. No staff/Auth/RLS/table-grant changes.
- Existing function source hashes matched the production functions before replacement. No guests, check-ins, sales or test bookings were written to production.

Vercel status
- Project hoa-booking, production domain hoa-booking-seven.vercel.app.
- Confirmed existing production variables initially contained only the three NEXT_PUBLIC_EMAILJS_* entries.
- Successfully added EXHIBITION_SUPABASE_URL, BOOKING_ORIGIN and EXHIBITION_BOOKING_SECRET as Secret variables for Production. Values are not stored in this report or repository.
- EXHIBITION_SUPABASE_SERVICE_ROLE_KEY is still missing. Browser automation stopped automatically because it could not determine the current browser URL with sufficient confidence. No attempt was made to bypass that restriction or retrieve browser credentials by another method.
- The missing key must be entered as a server-only Secret variable on this Vercel project, then the latest deployment redeployed. Never use NEXT_PUBLIC_ for it. Local .env.local still needs equivalent server settings to run a live local booking server; existing values were not overwritten.
- Until the missing key and deployment are confirmed, the production booking integration is not considered operational. No real production booking/notification was tested.

Tests
- TypeScript, ESLint and production build passed.
- Eight isolated capacity checks passed: idempotent 40-slot seeding, hourly 60, daily 200, availability, cancellation, same-day and cross-day rescheduling, rejection of overlapping/new expanded slots, preserved Protocol RPC access and denied direct table access.
- Eight existing booking server/domain tests passed with actual handlers and an isolated database, synthetic credentials and mocked EmailJS failure.
- Capacity fixture currently uses the sibling gallery-org test helpers and PGlite dependency; run from booking with node tests/capacity.database.mjs.
- No authenticated browser form submission or physical/mobile visual acceptance test completed in this turn.
