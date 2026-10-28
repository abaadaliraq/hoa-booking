"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { normalizePhone, type Slot } from "../../lib/exhibition/domain";
import { visitTimeChoices, timeWindowLabel } from "../../lib/exhibition/schedule";
import { WHATSAPP_BOOKING_PHONE } from "./bookingData";
import styles from "./booking.module.css";
type Ticket = {
  booking: {
    id: string;
    booking_reference: string;
    full_name: string;
    visit_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    status: string;
  };
  qr: string | null;
  notification_status: string;
};
export default function ExhibitionVisit({
  date,
  count,
  onLock,
}: {
  date: string;
  count: string;
  onLock: (locked: boolean) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]),
    [slot, setSlot] = useState(""),
    [error, setError] = useState(""),
    [slotsError, setSlotsError] = useState(""),
    [loading, setLoading] = useState(true),
    [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [email, setEmail] = useState(""),
    [notes, setNotes] = useState(""),
    [busy, setBusy] = useState(false),
    [ticket, setTicket] = useState<Ticket | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const pending = useRef<{
    key: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  function persist(value: unknown) {
    try {
      if (value)
        sessionStorage.setItem(
          "abaad_exhibition_request",
          JSON.stringify(value),
        );
      else sessionStorage.removeItem("abaad_exhibition_request");
    } catch {
      /* Same-page retries remain safe when storage is unavailable. */
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("abaad_exhibition_request") || "null",
        );
        if (saved?.key && saved?.payload?.visit_date === date) {
          pending.current = saved;
          setHasPending(true);
          setName(saved.payload.full_name || "");
          setPhone(saved.payload.phone || "");
          setEmail(saved.payload.email || "");
          setNotes(saved.payload.notes || "");
          setSlot(saved.payload.slot_id || "");
          onLock(true);
        }
      } catch {
        /* Ignore malformed browser storage. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [date, onLock]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/exhibition/slots", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.slots))
        throw Error(data.error || "تعذر تحميل المواعيد.");
      setSlots(data.slots);
      setSlotsError("");
    } catch (e) {
      setSlots([]);
      setSlotsError(e instanceof Error ? e.message : "تعذر تحميل المواعيد.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    const online = () => void load();
    window.addEventListener("online", online);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", online);
    };
  }, [load]);
  async function submit(retry = false) {
    if (busy) return;
    if (!retry && pending.current) {
      setError(
        "يوجد طلب لم تتأكد نتيجته. أعد التحقق منه أولاً قبل بدء حجز آخر.",
      );
      return;
    }
    if (!retry) {
      if (
        name.trim().length < 2 ||
        name.length > 160 ||
        !normalizePhone(phone) ||
        !slot ||
        !Number.isInteger(Number(count)) ||
        Number(count) < 1 ||
        Number(count) > 60 ||
        (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      ) {
        setError(
          "أكمل الاسم والهاتف العراقي والموعد وعدد الأشخاص والبريد إن وجد.",
        );
        return;
      }
      pending.current = {
        key: crypto.randomUUID(),
        payload: {
          full_name: name.trim(),
          phone,
          email: email.trim(),
          notes: notes.trim(),
          visit_date: date,
          slot_id: slot,
          guest_count: Number(count),
          website: honeypot.current?.value || "",
        },
      };
      persist(pending.current);
      setHasPending(true);
      onLock(true);
    }
    const req = pending.current;
    if (!req) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/exhibition/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req.payload, request_key: req.key }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (
          response.status === 400 ||
          response.status === 409 ||
          response.status === 429
        ) {
          pending.current = null;
          persist(null);
          setHasPending(false);
          onLock(false);
        }
        throw Error(data.error || "تعذر تأكيد الحفظ.");
      }
      if (!data.booking?.booking_reference)
        throw Error("تعذر التحقق من تأكيد الحفظ.");
      setTicket(data);
      if (data.booking.status !== "confirmed")
        setError("هذا الحجز ملغى. راجع بيت التحفيات.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "تعذر الاتصال. أعد المحاولة بنفس الطلب.",
      );
    } finally {
      setBusy(false);
    }
  }
  const available = slots.filter((s) => s.visit_date === date),
    selected = available.find((s) => s.id === slot);
  const timeChoices = visitTimeChoices(slots, date, Number(count));
  return (
    <section
      dir="rtl"
      className={styles.exhibitionSection}
      aria-label="حجز زيارة المعرض"
    >
      <h3>زيارة معرض نعيمة وذاكرة بغداد</h3>
      <p>
        يسرّ بيت التحفيات استقبال زواره خلال أيام المعرض الفني. اختر موعد زيارتك وأكمل بيانات الحجز.
      </p>
      <p>
        <strong>يرجى الحجز المسبق وإبراز رمز الحجز عند الوصول.</strong>
      </p>
      {ticket ? (
        <div className={styles.exhibitionTicket} id="exhibition-ticket">
          <h3>
            {ticket.booking.status === "confirmed"
              ? "تم تأكيد حجز زيارتكم"
              : "الحجز ملغى"}
          </h3>
          <p>معرض نعيمة وذاكرة بغداد · بيت التحفيات — بغداد</p>
          <dl>
            <dt>الاسم</dt>
            <dd>{ticket.booking.full_name}</dd>
            <dt>تاريخ الزيارة</dt>
            <dd>{ticket.booking.visit_date}</dd>
            <dt>الوقت — بغداد</dt>
            <dd>
              {timeWindowLabel(ticket.booking.start_time, ticket.booking.end_time)}
            </dd>
            <dt>عدد الأشخاص</dt>
            <dd>{ticket.booking.guest_count}</dd>
            <dt>رقم الحجز</dt>
            <dd dir="ltr">{ticket.booking.booking_reference}</dd>
          </dl>
          {ticket.qr && (
            <Image
              unoptimized
              src={ticket.qr}
              width="256"
              height="256"
              alt="رمز الحجز للتحقق عند الوصول"
            />
          )}
          <p>
            يرجى الاحتفاظ برمز الحجز وإبرازه عند الوصول إلى بيت التحفيات. الدخول
            متاح للحجوزات المؤكدة فقط.
          </p>
          <p role="status">
            {ticket.notification_status === "sent"
              ? "تم إرسال إشعار البريد."
              : ticket.notification_status === "sending"
                ? "الحجز محفوظ، إشعار البريد قيد المعالجة."
                : "الحجز محفوظ. إشعار البريد لم يُؤكّد؛ يمكنك إعادة المحاولة بعد دقيقة دون إنشاء حجز آخر."}
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={() => window.print()}>
              حفظ / طباعة التذكرة
            </button>
            {ticket.notification_status !== "sent" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit(true)}
              >
                إعادة محاولة الإشعار / التحقق
              </button>
            )}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                "https://wa.me/" +
                WHATSAPP_BOOKING_PHONE +
                "?text=" +
                encodeURIComponent(
                  [
                    "حجز معرض نعيمة وذاكرة بغداد",
                    ticket.booking.booking_reference,
                    ticket.booking.full_name,
                    ticket.booking.visit_date,
                    ticket.booking.start_time,
                    ticket.booking.guest_count + " أشخاص",
                  ].join(" — "),
                )
              }
            >
              فتح WhatsApp لإرسال التفاصيل
            </a>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setTicket(null);
              pending.current = null;
              persist(null);
              setHasPending(false);
              onLock(false);
              void load();
            }}
          >
            بدء حجز جديد
          </button>
          <small>
            يفتح الرابط WhatsApp؛ اضغط إرسال داخل التطبيق لإرسال الرسالة.
          </small>
        </div>
      ) : (
        <>
          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>الاسم الكامل</span>
              <input
                maxLength={160}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className={styles.field}>
              <span>الهاتف العراقي</span>
              <input
                type="tel"
                dir="ltr"
                placeholder="07xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                maxLength={24}
              />
            </label>
            <label className={styles.field}>
              <span>البريد الإلكتروني — اختياري</span>
              <input
                type="email"
                dir="ltr"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className={styles.field}>
              <span>وقت الزيارة — بغداد</span>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                disabled={loading || busy || hasPending}
              >
                <option value="">
                  {loading ? "جارٍ تحميل المواعيد…" : slotsError ? "تعذر تحميل المواعيد" : "اختر وقت الزيارة"}
                </option>
                {timeChoices.map(choice => (
                  <option key={choice.key} value={choice.slot?.id || "unavailable-" + choice.key} disabled={choice.disabled}>
                    {choice.label}{choice.slot && choice.disabled ? " — لا يتسع للعدد المحدد" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.fieldWide}>
              <span>ملاحظات — اختياري</span>
              <textarea
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
          <label className={styles.honeypot} aria-hidden>
            الموقع
            <input ref={honeypot} tabIndex={-1} autoComplete="off" />
          </label>
          {slotsError && <p role="alert" className={styles.warning}>{slotsError}</p>}
          {!loading && !slotsError && !available.length && (
            <p>
              لا توجد مواعيد متاحة لهذا اليوم. اختر يوماً آخر.
            </p>
          )}
          <p>
            ملخص الزيارة: {date} ·{" "}
            {selected
              ? timeWindowLabel(selected.start_time, selected.end_time)
              : "اختر الوقت"}{" "}
            · {count} أشخاص
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              disabled={busy || loading || !selected || selected.remaining < Number(count) || Number(count) < 1 || Number(count) > 60 || !!slotsError || hasPending}
              onClick={() => void submit()}
            >
              {" "}
              {busy ? "جارٍ التحقق والحفظ…" : "تأكيد الحجز"}
            </button>
            <button type="button" disabled={busy} onClick={() => void load()}>
              تحديث المواعيد
            </button>
            {hasPending && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit(true)}
              >
                التحقق من الطلب السابق
              </button>
            )}
          </div>
        </>
      )}
      {error && (
        <p role="alert" className={styles.warning}>
          {error}
        </p>
      )}
    </section>
  );
}
