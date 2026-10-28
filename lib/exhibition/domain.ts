export const exhibitionDates = {
  opening: "2026-10-30",
  first: "2026-10-31",
  last: "2026-11-09",
  regular: "2026-11-10",
} as const;
export function visitMode(date: string) {
  if (date === exhibitionDates.opening) return "private";
  if (date >= exhibitionDates.first && date <= exhibitionDates.last)
    return "exhibition";
  return "regular";
}
export function visitPrice(date: string) {
  return visitMode(date) === "exhibition"
    ? 0
    : date >= exhibitionDates.regular
      ? 15
      : 20;
}
export function normalizePhone(value: string) {
  const clean = value
    .replace(/[٠-٩۰-۹]/g, (c) =>
      String(
        "٠١٢٣٤٥٦٧٨٩".includes(c)
          ? "٠١٢٣٤٥٦٧٨٩".indexOf(c)
          : "۰۱۲۳۴۵۶۷۸۹".indexOf(c),
      ),
    )
    .replace(/[\s()-]/g, "");
  const phone = clean
    .replace(/^00964/, "+964")
    .replace(/^964/, "+964")
    .replace(/^07/, "+9647");
  return /^\+9647[0-9]{9}$/.test(phone) ? phone : null;
}
export type Slot = {
  id: string;
  visit_date: string;
  start_time: string;
  end_time: string;
  remaining: number;
};
export type BookingInput = {
  full_name: string;
  phone: string;
  email: string;
  visit_date: string;
  slot_id: string;
  guest_count: number;
  notes: string;
};
export function validateBooking(value: unknown): BookingInput {
  if (!value || typeof value !== "object") throw Error("البيانات غير صالحة.");
  const x = value as Record<string, unknown>;
  const str = (k: string) =>
    typeof x[k] === "string" ? (x[k] as string).trim() : "";
  const full_name = str("full_name"),
    phone = normalizePhone(str("phone")),
    email = str("email"),
    notes = str("notes"),
    visit_date = str("visit_date"),
    slot_id = str("slot_id"),
    guest_count = x.guest_count;
  if (
    full_name.length < 2 ||
    full_name.length > 160 ||
    !phone ||
    email.length > 254 ||
    (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    notes.length > 500 ||
    visitMode(visit_date) !== "exhibition" ||
    !/^2026-(10|11)-\d{2}$/.test(visit_date) ||
    !Number.isFinite(Date.parse(visit_date + "T12:00:00Z")) ||
    new Date(visit_date + "T12:00:00Z").toISOString().slice(0, 10) !==
      visit_date ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slot_id,
    ) ||
    typeof guest_count !== "number" ||
    !Number.isInteger(guest_count) ||
    guest_count < 1 ||
    guest_count > 200
  )
    throw Error("تحقق من الاسم والهاتف العراقي والتاريخ والموعد وعدد الأشخاص.");
  return { full_name, phone, email, notes, visit_date, slot_id, guest_count };
}
