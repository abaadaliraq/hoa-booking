# Daily exhibition booking and gender

Prepared locally; production SQL has NOT been executed and this change has NOT been deployed.

- Remove the public hourly selector. The submitted slot represents the full 17:00–21:00 Baghdad window for the selected day, not a concealed hourly assignment.
- Require the booking holder's gender (male/female). Historical bookings and door entries keep NULL; companions' gender is never inferred.
- Keep the existing maximum of 60 people per individual request, with a shared 200-person daily ceiling across website and door entries.
- Show gender in Administration/Protocol booking details. Send it as an EmailJS template parameter; the visit time now contains the full window.
- Existing QR tokens, request hashes, arrival counts, visitor profiles and booking IDs are preserved. Stored pending requests without gender can replay if already committed; an uncommitted request asks for gender before creating a new booking.

## Activation order

1. Review `supabase/daily-booking-gender.review.sql` for project `pwlwelxnrrignapdsyiw` only. Apply only after approval.
2. Run the SQL transaction. It guards existing function bodies against unexpected changes, leaves function grants/RLS/Auth intact, and aborts if existing daily counts exceed 200 or the schedule differs unexpectedly.
3. Publish the booking and gallery code together. Do not publish the public form before SQL: the new form deliberately refuses hourly inventory rather than silently assigning a time or losing gender.
4. Verify public daily availability and a real authorized customer/staff journey. Do not fabricate production reservations.

The existing 17:00 slot becomes 17:00–21:00 with capacity 200. Other hourly slots are closed for new reservations and retained for historical bookings. All their reserved counts still contribute to the daily cap. Existing administrative closures on the 17:00 slot stay closed. SQL may be run again safely.

## Verified locally

- PGlite: schema/schedule rollback, reapplication, preservation of legacy records/tokens/retries, gender validation and staff visibility, door arrival, combined cap at exactly 200, cancellation/rescheduling, denied roles/direct table reads and closing at 21:00 Baghdad.
- Actual server handler with isolated database and mocked EmailJS: confirmed booking, failed/successful email delivery, no duplicate retries, correct gender and full visit window, unchanged QR opaque token and server-only credentials.
- React static form/ticket rendering, FormData/autofill validation, international phone support and QR image export tests.

No production writes, real notification emails or physical phone tests were performed.
