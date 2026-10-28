import { createHash, createHmac, randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { validateBooking } from "./domain";
const target = "https://pwlwelxnrrignapdsyiw.supabase.co";
export const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
export class BookingServiceError extends Error {
  constructor(public readonly supportCode: string) {
    super("Booking service unavailable");
  }
}
export function config() {
  const url = process.env.EXHIBITION_SUPABASE_URL?.trim().replace(/\/$/, ""),
    key = process.env.EXHIBITION_SUPABASE_SERVICE_ROLE_KEY?.trim(),
    secret = process.env.EXHIBITION_BOOKING_SECRET;
  if (url !== target) throw new BookingServiceError("CONFIG_URL");
  if (!key) throw new BookingServiceError("CONFIG_KEY");
  if (!key.startsWith("sb_secret_")) {
    // This is configuration validation only; Supabase verifies authenticity.
    let claims;
    try {
      claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    } catch {
      throw new BookingServiceError("CONFIG_KEY_TYPE");
    }
    if (claims.role !== "service_role")
      throw new BookingServiceError("CONFIG_KEY_ROLE");
    if (claims.ref !== "pwlwelxnrrignapdsyiw")
      throw new BookingServiceError("CONFIG_KEY_PROJECT");
  }
  if (!secret || secret.length < 32)
    throw new BookingServiceError("CONFIG_SIGNING");
  return { url, key, secret };
}
export async function rpc<T>(
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { url, key } = config();
  const res = await fetch(url + "/rest/v1/rpc/" + name, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: key,
      ...(key.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + key }),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    // Return only fixed categories; never expose upstream bodies or credentials.
    const detail = await res.json().catch(() => null);
    const message = typeof detail?.message === "string" ? detail.message : "";
    const code = typeof detail?.code === "string" ? detail.code : "";
    if (res.status === 401 && /invalid api key/i.test(message))
      throw new BookingServiceError("KEY_REJECTED");
    if (res.status === 401 && /^PGRST30[123]$/.test(code))
      throw new BookingServiceError("TOKEN_REJECTED");
    if (code === "42501")
      throw new BookingServiceError("DATABASE_PERMISSION");
    throw new BookingServiceError("DATABASE_" + res.status);
  }
  return res.json();
}
export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export function tokenFor(key: string) {
  return createHmac("sha256", config().secret)
    .update("ticket:" + key)
    .digest("hex");
}
export function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = process.env.BOOKING_ORIGIN;
  if (!allowed)
    return (
      process.env.NODE_ENV === "development" &&
      origin === new URL(request.url).origin
    );
  return origin === allowed;
}
export type Saved = {
  ok: boolean;
  code?: string;
  booking?: {
    id: string;
    booking_reference: string;
    full_name: string;
    visit_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    status: string;
    price_usd: number;
    created_at:string;
  };
  notification_status?: string;
};
async function notify(
  saved: Saved,
  token: string,
  input: ReturnType<typeof validateBooking>,
) {
  const b = saved.booking!;
  if (b.status !== "confirmed") return saved.notification_status;
  const lease = randomUUID();
  const claim = await rpc<{ claimed: boolean; status: string }>(
    "booking_notification",
    { p_id: b.id, p_token_hash: hash(token), p_lease: lease, p_status: null },
  );
  if (!claim.claimed) return claim.status;
  let status = "failed";
  const service =
      process.env.EMAILJS_SERVICE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    template =
      process.env.EMAILJS_TEMPLATE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey =
      process.env.EMAILJS_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!service || !template || !publicKey) status = "unconfigured";
  else
    try {
      const timeAr=new Intl.DateTimeFormat('ar-IQ',{timeZone:'Asia/Baghdad',hour:'numeric',minute:'2-digit'}).format(new Date(b.visit_date+'T'+b.start_time+'+03:00'));
      const params = {
        created_at:b.created_at,
        start_time_ar:timeAr,visit_time_ar:timeAr,
        end_time:b.end_time,payment_required:'لا',payment_card_number:'-',
        booking_id: b.booking_reference,
        event_type: "زيارة معرض نعيمة وذاكرة بغداد",
        full_name: b.full_name,
        phone: input.phone,
        email: input.email,
        booking_date: b.visit_date,
        start_time: b.start_time,
        visit_time: b.start_time,
        people_count: b.guest_count,
        payment_per_person: "",
        payment_total: "",
        payment_method: "",
        notes: input.notes,
        message: [
          b.booking_reference,
          b.full_name,
          b.visit_date,
          b.start_time,
          b.guest_count + " أشخاص",
        ].join(" — "),
      };
      const result = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: service.trim(),
            template_id: template.trim(),
            user_id: publicKey.trim(),
            ...(process.env.EMAILJS_PRIVATE_KEY?.trim()
              ? { accessToken: process.env.EMAILJS_PRIVATE_KEY.trim() }
              : {}),
            template_params: {...params,summary:params.message},
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      status = result.ok ? "sent" : "failed";
    } catch {
      status = "failed";
    }
  try {
    await rpc("booking_notification", {
      p_id: b.id,
      p_token_hash: hash(token),
      p_lease: lease,
      p_status: status,
    });
  } catch {
    /* The booking remains saved; stale lease can be recovered after five minutes. */ return "pending";
  }
  return status;
}
export async function createBooking(request: Request) {
  if (!allowedOrigin(request))
    return Response.json(
      { error: "طلب غير مصرح." },
      { status: 403, headers: responseHeaders },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json(
      { error: "صيغة الطلب غير صالحة." },
      { status: 415, headers: responseHeaders },
    );
  let input: ReturnType<typeof validateBooking>, key: string;
  try {
    const raw = await request.text();
    if (raw.length > 4096) throw Error("too_long");
    const body = JSON.parse(raw);
    if (body.website) throw Error("robot");
    input = validateBooking(body);
    key = body.request_key;
    if (
      typeof key !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        key,
      )
    )
      throw Error("key");
  } catch {
    return Response.json(
      { error: "تحقق من البيانات ورقم الهاتف العراقي والموعد المختار." },
      { status: 400, headers: responseHeaders },
    );
  }
  try {
    const token = tokenFor(key);
    const ip =
      process.env.VERCEL === "1"
        ? request.headers
            .get("x-vercel-forwarded-for")
            ?.split(",")[0]
            ?.trim() || "unknown"
        : "local-development";
    const saved = await rpc<Saved>("booking_create", {
      p_data: input,
      p_request_key: key,
      p_request_hash: hash(JSON.stringify(input)),
      p_token_hash: hash(token),
      p_ip_hash: createHmac("sha256", config().secret)
        .update("ip:" + ip)
        .digest("hex"),
    });
    if (!saved.ok || !saved.booking)
      return Response.json(
        {
          error:
            saved.code === "daily_capacity"
              ? "اكتمل عدد الزوار لهذا اليوم. اختر يوماً آخر."
              : saved.code === "capacity"
              ? "الأماكن المتبقية لا تكفي. اختر موعداً آخر."
              : saved.code === "rate_limit"
                ? "تجاوزت محاولات الحجز المسموحة. حاول لاحقاً."
                : "الموعد مغلق أو غير متاح.",
        },
        {
          status: saved.code === "rate_limit" ? 429 : 409,
          headers: responseHeaders,
        },
      );
    // No notification error can erase or hide a successfully committed booking.
    let notification = saved.notification_status || "pending";
    try {
      notification = (await notify(saved, token, input)) || "pending";
    } catch {
      notification = "pending";
    }
    let qr: string | null = null;
    try {
      qr = await QRCode.toDataURL("ABAAD-BOOKING:" + token, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 256,
      });
    } catch {
      /* The reference is still a valid manual lookup. */
    }
    return Response.json(
      { booking: saved.booking, qr, notification_status: notification },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json(
      {
        error:
          "تعذر تأكيد الحفظ. احتفظ بالبيانات وأعد المحاولة بنفس الطلب. الحجز غير مفتوح قبل اعتماد التهيئة.",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
