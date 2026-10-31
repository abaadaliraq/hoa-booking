import { normalizePhone, validateBooking } from "./domain";

/** Read the submitted controls, including browser/password-manager autofill. */
export function bookingFormInput(form: FormData, date: string, count: string) {
  const text = (name: string) => String(form.get(name) ?? "").trim();
  const full_name = text("full_name"), phone = text("phone"), email = text("email");
  if (full_name.length < 2 || full_name.length > 160)
    throw Error("يرجى إدخال الاسم الكامل، من حرفين إلى 160 حرفاً.");
  if (!normalizePhone(phone))
    throw Error("أدخل رقم الهاتف مع رمز الدولة، مثال: +447700900123، أو الرقم العراقي مثل 07701234567.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw Error("يرجى التحقق من البريد الإلكتروني أو تركه فارغاً.");
  if (!text("slot_id")) throw Error("يرجى اختيار وقت الزيارة.");
  return validateBooking({ full_name, phone, email, notes: text("notes"),
    visit_date: date, slot_id: text("slot_id"), guest_count: Number(count) });
}
