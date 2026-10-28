# Booking input and receipt refinement — 2026-10-28

Scope: C:\HOA-SYSTEM\booking only. No database, Authentication, capacity, price, QR payload, booking RPC or Protocol changes.

- Submit reads named controls through FormData rather than relying on potentially stale React state. Text fields preserve native browser/autofill values. Per-field validation reports the actual invalid field. Existing server validation remains authoritative.
- The visit component is no longer remounted whenever the selected date changes, preserving guest inputs. Existing pending-request persistence, request key and retry behavior remain in place.
- A separate ExhibitionTicket component renders authoritative booking data and the existing QR image. Cancelled tickets do not show an entry QR. No preview or invented QR is used by the application.
- Success view hides the booking hero, date and party controls; the receipt presents guest, date, Baghdad time, party count, reference and QR with ivory/burgundy styling. Print styling targets the receipt; notification retry, WhatsApp sharing and new-booking actions remain outside the printable ticket.

Verification
- TypeScript, ESLint and Production Build passed.
- 10 unit checks passed, including populated FormData with Arabic telephone digits, field-specific errors, unchanged QR source, cancelled/missing-QR states, schedule and credential safety.
- Eight isolated database capacity checks passed; no production writes.
- Browser-tested the real production-build UI through a localhost-only mock proxy: populated name/phone, invalid email feedback, corrected email followed by success without retyping name/phone, receipt and QR rendered. All booking requests in this test were intercepted locally; no production booking/email/Protocol notification was created.
- Receipt CSS inspected at 339px, 390px and desktop width. The actual app at 390px had no horizontal overflow and a 208px QR image. Preview data and QR are synthetic and run only from the explicit test-script flags.
- Physical iPhone/Safari autofill and an actual printer were not tested. The browser-specific autofill hypothesis was not independently reproduced on a physical device; submission now reads the visible controls directly.
