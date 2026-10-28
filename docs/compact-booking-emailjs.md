# Compact booking form, QR-first receipt and EmailJS activation

Project: C:\HOA-SYSTEM\booking; production hoa-booking-seven.vercel.app.

- Scoped border-box sizing fixes controls extending outside their grid cells. Both grid tracks and input minimum widths allow shrinking. Desktop form width is capped at 780px and centered; mobile date receives two-thirds of its row and party count one-third. Other mobile fields stack with compact spacing and 16px input text.
- Receipt starts with the unchanged real booking QR, followed by concise confirmation, guest and visit facts. Removed duplicate header/hero and long instructions from success view. Download control saves the server-generated PNG using a named download attribute; print and WhatsApp actions remain available. No new QR content or token is created client-side.
- Time selection remains real hourly inventory only: 17–18, 18–19, 19–20 and 20–21 Baghdad time, with existing capacity/availability checks. No custom time can bypass those intervals.
- Live EmailJS diagnosis used deliberately invalid template/service requests, so no message could be sent: server requests were rejected with 403 because non-browser access was disabled. Four existing notification rows were failed. After explicit user action-time confirmation, enabled non-browser API requests and kept Use Private Key checked. A second no-delivery probe returned private-key-required, confirming protection remains enforced.
- User confirmed saving EMAILJS_PRIVATE_KEY as a Production Secret in Vercel. The existing server sender already supports accessToken; it now trims copied whitespace in provider identifiers and credentials. Private key remains server-side. No EmailJS key value was placed in code, chat or tests.

Verification
- TypeScript, ESLint and production build passed.
- 10 form/ticket/schedule/configuration checks passed; ticket markup asserts image precedes guest facts.
- 9 actual server-handler/isolated database checks passed, including simulated EmailJS success and failure, private-key transport, no private key in ticket response, no immediate duplicate notification and saved booking surviving mail failure. The older sibling test script uses an obsolete untyped synthetic key and fails the current credential guard; the booking-local fixture uses a clearly synthetic sb_secret value. No sibling project files were modified.
- 8 isolated capacity checks passed.
- Browser-tested the production-build app against localhost-only booking mocks. At 339px, page content width was 324px, all visible controls stayed inside the viewport and a local synthetic confirmation showed QR first plus PNG download control. No production booking, arrival or email was created.
- A download event could not be confirmed in the in-app browser; the PNG href and download filename were checked. Physical iPhone/Safari saving and printer output are not verified.
- Actual end-to-end EmailJS delivery and inbox receipt remain unverified until an authorized real booking/retry is made after deployment. Do not claim a delivered email from configuration checks alone.
