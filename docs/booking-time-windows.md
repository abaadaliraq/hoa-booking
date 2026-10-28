# Booking time windows — 2026-10-28

Project: C:\HOA-SYSTEM\booking
Production: https://hoa-booking-seven.vercel.app/
Supabase: pwlwelxnrrignapdsyiw

Diagnosis
- Production GET /api/exhibition/slots returned HTTP 503.
- Read-only database verification confirmed 40 open slots, covering 17:00–18:00, 18:00–19:00, 19:00–20:00 and 20:00–21:00. Hourly capacity remains 60 and the shared daily ceiling remains 200. No production bookings existed at this check.
- The Vercel project list still lacked EXHIBITION_SUPABASE_SERVICE_ROLE_KEY. The three previously configured server variables were present. This is a connection/configuration failure, not unopened inventory.

Changes
- Schedule labels now display 5–6, 6–7, 7–8 and 8–9 مساءً instead of 24-hour values, including ticket/summary times.
- All four scheduled periods remain visible. Only a matching real slot from the successful server response is selectable, with enough remaining space for the party. No placeholder booking identifiers are accepted.
- Loading failures are separate from form validation errors and empty availability. A server failure no longer claims that dates have not been opened.
- Server-side RPC fetches support modern sb_secret keys through apikey without treating them as Bearer JWTs. Legacy JWT server keys retain their existing Authorization header. URL/key input trims accidental copy whitespace; no key value was placed in code, logs or this report.

Verification
- Four isolated schedule/key-transport tests passed.
- Eight existing isolated capacity tests passed.
- Eight existing booking HTTP/domain tests passed.
- TypeScript, ESLint and Production Build checked.
- No production SQL, reservations, arrival events, accounts, RLS or Auth changes in this task.

Activation
- Existing authorization permits the server key to be configured as a Secret for Production on Vercel project hoa-booking. Browser automation could inspect both services but button clicks did not complete the key transfer, so the user was asked to enter/save the key directly without sharing it in the chat.
- Operational acceptance requires the deployed /api/exhibition/slots response to be 200 and return the real inventory. Do not mark this issue complete on the basis of static time labels alone.

Reference: https://supabase.com/docs/guides/getting-started/api-keys#known-limitations
