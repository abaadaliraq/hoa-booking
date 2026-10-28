# Booking time windows — 2026-10-28

Project: C:\HOA-SYSTEM\booking
Production: https://hoa-booking-seven.vercel.app/
Supabase: pwlwelxnrrignapdsyiw

Diagnosis
- Production GET /api/exhibition/slots returned HTTP 503.
- Read-only database verification confirmed 40 open slots, covering 17:00–18:00, 18:00–19:00, 19:00–20:00 and 20:00–21:00. Hourly capacity remains 60 and the shared daily ceiling remains 200. No production bookings existed at this check.
- At initial inspection, the Vercel project list lacked EXHIBITION_SUPABASE_SERVICE_ROLE_KEY. The three previously configured server variables were present. This is a connection/configuration failure, not unopened inventory.

Changes
- Schedule labels now display 5–6, 6–7, 7–8 and 8–9 مساءً instead of 24-hour values, including ticket/summary times.
- All four scheduled periods remain visible. Only a matching real slot from the successful server response is selectable, with enough remaining space for the party. No placeholder booking identifiers are accepted.
- Loading failures are separate from form validation errors and empty availability. A server failure no longer claims that dates have not been opened.
- Server-side RPC fetches support modern sb_secret keys through apikey without treating them as Bearer JWTs. Legacy JWT server keys retain their existing Authorization header. URL/key input trims accidental copy whitespace; no key value was placed in code, logs or this report.

Verification
- Seven isolated schedule/key-transport/diagnostic tests passed.
- Eight existing isolated capacity tests passed.
- Eight existing booking HTTP/domain tests passed.
- TypeScript, ESLint and Production Build checked.
- No production SQL, reservations, arrival events, accounts, RLS or Auth changes in this task.

Activation
- Existing authorization permits the server key to be configured as a Secret for Production on Vercel project hoa-booking. Browser automation could inspect both services but button clicks did not complete the key transfer, so the user was asked to enter/save the key directly without sharing it in the chat.
- The user subsequently confirmed saving the Production Secret directly in Vercel on 2026-10-28. A fresh deployment must read this new configuration. No key value was shared in the chat or source control.
- Post-deployment verification still returned 503. Safe diagnostic code CONFIG_KEY confirms the deployed process has no EXHIBITION_SUPABASE_SERVICE_ROLE_KEY; the refreshed project environment list also lacks that name. User confirmation alone did not establish successful provisioning. The user was asked to verify the saved entry in the exact project and Production scope.
- Availability responses include only allowlisted configuration categories or upstream HTTP status as support_code; upstream bodies, credentials and booking data are never included in diagnostics.
- On the next user-confirmed save, deployment 6fc4f05 read a nonempty key but Supabase returned 401. Fixed-category diagnostics identified a database permission denial. Read-only execution of public.booking_slots() as service_role returned all 40 slots, confirming the existing database grants work without modification.
- Deployment 227843e adds server credential type/legacy-role/project checks. Production returned CONFIG_KEY_TYPE: the saved value is neither a modern server secret nor a parseable legacy service-role JWT. The user must replace it with the complete Secret key using the Dashboard Copy control. No key was read, printed, committed or sent to the browser.
- Resolved after the user confirmed replacing the value with the complete key. Deployment 2ca6f263a830005bb4c9cb9bda1a5714414a451e succeeded on Vercel. Production GET /api/exhibition/slots returned HTTP 200 and all 40 real slots, covering 2026-10-31 through 2026-11-09 with 17–18, 18–19, 19–20 and 20–21 each day. The first day's four slots each returned 60 remaining. The live browser form showed an enabled time selector, a selected 5–6 مساءً period, matching visit summary and enabled confirmation button with no loading error. No production reservation was submitted by the agent; real booking creation, email delivery and Protocol notification were not end-to-end tested in this acceptance check.
- Operational acceptance requires the deployed /api/exhibition/slots response to be 200 and return the real inventory. Do not mark this issue complete on the basis of static time labels alone.

Reference: https://supabase.com/docs/guides/getting-started/api-keys#known-limitations
