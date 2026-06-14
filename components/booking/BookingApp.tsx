"use client";

import { useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

import styles from "./booking.module.css";
import { BookingFormData, BookingType } from "./bookingTypes";
import {
  calculateDuration,
  calculatePayment,
  getEventTypeName,
  makeBookingId,
  nowText,
  timeToArabic,
} from "./bookingUtils";

import BookingBanner from "./BookingBanner";
import BookingTypeSelector from "./BookingTypeSelector";
import CustomerFields from "./CustomerFields";
import GroupFields from "./GroupFields";
import PaymentFields from "./PaymentFields";
import ReservationReport from "./ReservationReport";
import ReportActions from "./ReportActions";

import VisitFields from "./fields/VisitFields";
import RestaurantFields from "./fields/RestaurantFields";
import PhotographyFields from "./fields/PhotographyFields";
import OccasionFields from "./fields/OccasionFields";
import WorkshopFields from "./fields/WorkshopFields";

const emptyData: BookingFormData = {
  booking_id: "",
  created_at: "",

  event_type: "",
  people_count: "1",
  booking_date: "",
  start_time: "",
  start_time_ar: "",
  end_time: "",
  end_time_ar: "",
  duration_hours: "",

  full_name: "",
  birthdate: "",
  phone: "",
  customer_email: "",

  has_kids: "",
  youngest_kid_age: "",

  photography_type: "",
  photography_other: "",
  photography_hours: "",
  photography_price_per_hour: "0",

  payment_required: "",
  payment_method: "",
  payment_per_person: "",
  payment_total: "",
  payment_card_number: "",
  payment_ref: "",
  payment_notice: "",

  occasion_type: "",
  occasion_other: "",
  decor_provider: "",
  food_from_hoa: "",
  has_band: "",
  band_details: "",

  group_type: "",
  is_foreign: "",
  country: "",
  province: "",
  interests: "",

  restaurant_area: "",
  restaurant_booking_type: "",
  food_notes: "",

  workshop_topic: "",
  organizer_name: "",
  needs_projector: "",
  needs_microphone: "",

  notes: "",
};

export default function BookingApp() {
  const [bookingType, setBookingType] = useState<BookingType>("visit");
  const [data, setData] = useState<BookingFormData>(emptyData);
  const [reportData, setReportData] = useState<BookingFormData | null>(null);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const payment = useMemo(() => {
    return calculatePayment(bookingType, data);
  }, [bookingType, data]);

  const peopleCount = Number(data.people_count || 0);
const isSoon =
  bookingType === "restaurant" ||
  bookingType === "auction" ||
  bookingType === "exhibition";
  function update(name: keyof BookingFormData, value: string) {
    setData((prev) => {
      const next: BookingFormData = {
        ...prev,
        [name]: value,
      };

      if (name === "people_count") {
        const nextPeopleCount = Number(value || 0);

        if (nextPeopleCount < 4) {
          next.group_type = "";
          next.is_foreign = "";
          next.country = "";
          next.province = "";
        }
      }

      if (name === "start_time" || name === "end_time") {
        next.start_time_ar = timeToArabic(next.start_time);
        next.end_time_ar = timeToArabic(next.end_time);
        next.duration_hours = calculateDuration(
          next.start_time,
          next.end_time
        );
      }

      return next;
    });

    setReportData(null);
    setStatus("");
  }

  function buildFinalData() {
    const finalData: BookingFormData = {
      ...data,
      booking_id: data.booking_id || makeBookingId(),
      created_at: data.created_at || nowText(),

      event_type: getEventTypeName(bookingType),

      start_time_ar: timeToArabic(data.start_time),
      end_time_ar: timeToArabic(data.end_time),
      duration_hours: calculateDuration(data.start_time, data.end_time),

      payment_required: payment.payment_required,
      payment_per_person: payment.payment_per_person,
      payment_total: payment.payment_total,
      payment_card_number: payment.payment_card_number,
    };

    return finalData;
  }

  function validateBeforeSubmit() {
    if (isSoon) {
      return "هذا النوع من الحجز سيتوفر قريبًا.";
    }

    if (!data.people_count || Number(data.people_count) < 1) {
      return "اكتبي عدد الأشخاص بشكل صحيح.";
    }

    if (!data.booking_date) {
      return "اختاري تاريخ الحجز.";
    }

    if (!data.start_time) {
      return "اختاري وقت البداية.";
    }

    if (!data.end_time) {
      return "اختاري وقت النهاية.";
    }

    if (!calculateDuration(data.start_time, data.end_time)) {
      return "وقت النهاية لازم يكون بعد وقت البداية.";
    }

    if (!data.full_name.trim()) {
      return "اكتبي الاسم الكامل.";
    }

    if (!data.phone.trim()) {
      return "اكتبي رقم الهاتف.";
    }

    if (!data.customer_email.trim()) {
      return "اكتبي الإيميل.";
    }

    return "";
  }

  function handlePreview() {
    const validationMessage = validateBeforeSubmit();

    if (validationMessage) {
      setStatus(validationMessage);
      return;
    }

    const finalData = buildFinalData();
    setReportData(finalData);
    setStatus("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationMessage = validateBeforeSubmit();

    if (validationMessage) {
      setStatus(validationMessage);
      return;
    }

    const finalData = buildFinalData();
    setReportData(finalData);

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus(
        "إعدادات EmailJS ناقصة. تأكدي من أسماء المتغيرات داخل .env.local و Vercel."
      );
      return;
    }

    try {
      setSending(true);
      setStatus("");

      await emailjs.send(serviceId, templateId, finalData, {
        publicKey,
      });

      setStatus("تم إرسال طلب الحجز بنجاح.");
    } catch (error) {
      console.error(error);
      setStatus("فشل إرسال الحجز. راجعي Template ID و Public Key داخل EmailJS.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brandTitle}>
            <span>بيت التحفيات</span>
            <small>House of Antiques</small>
          </div>
        </header>

        <BookingBanner bookingType={bookingType} />

        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <section className={styles.formPanel}>
            <BookingTypeSelector
              value={bookingType}
              onChange={(value) => {
                setBookingType(value);
                setData((prev) => ({
                  ...prev,
                  group_type: "",
                  is_foreign: "",
                  country: "",
                  province: "",
                  interests: "",
                }));
                setReportData(null);
                setStatus("");
              }}
            />

            {isSoon ? (
              <div className={styles.soonBox}>
                هذا النوع من الحجز سيتوفر قريبًا.
              </div>
            ) : (
              <>
                <div className={styles.sectionTitle}>
                  تفاصيل الحجز / Booking Details
                </div>

                <div className={styles.twoCols}>
                  <label className={styles.field}>
                    <span>
                      عدد الأشخاص / <small>Guests</small>
                    </span>

                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={data.people_count}
                      onChange={(e) => update("people_count", e.target.value)}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span>
                      التاريخ / <small>Date</small>
                    </span>

                    <input
                      type="date"
                      value={data.booking_date}
                      onChange={(e) => update("booking_date", e.target.value)}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span>
                      وقت البداية / <small>Start Time</small>
                    </span>

                    <input
                      type="time"
                      value={data.start_time}
                      onChange={(e) => update("start_time", e.target.value)}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span>
                      وقت النهاية / <small>End Time</small>
                    </span>

                    <input
                      type="time"
                      value={data.end_time}
                      onChange={(e) => update("end_time", e.target.value)}
                      required
                    />
                  </label>
                </div>

                {data.start_time && data.end_time && !data.duration_hours && (
                  <p className={styles.warning}>
                    وقت النهاية لازم يكون بعد وقت البداية.
                  </p>
                )}

                {bookingType === "visit" && (
                  <VisitFields data={data} update={update} />
                )}

                {bookingType === "restaurant" && (
                  <RestaurantFields data={data} update={update} />
                )}

                {bookingType === "photography" && (
                  <PhotographyFields data={data} update={update} />
                )}

                {bookingType === "occasion" && (
                  <OccasionFields data={data} update={update} />
                )}

                {bookingType === "workshop" && (
                  <WorkshopFields data={data} update={update} />
                )}

                {peopleCount >= 4 && (
                  <GroupFields data={data} update={update} />
                )}

                <CustomerFields data={data} update={update} />

                {(bookingType === "visit" ||
                  bookingType === "photography") && (
                  <PaymentFields
                    data={data}
                    update={update}
                    payment={payment}
                  />
                )}

                <div className={styles.actions}>
                  <button type="button" onClick={handlePreview}>
                    عرض الملخص / Preview
                  </button>

                  <button type="submit" disabled={sending}>
                    {sending ? "جاري الإرسال..." : "إرسال الحجز / Submit"}
                  </button>
                </div>

                {status && <p className={styles.status}>{status}</p>}
              </>
            )}
          </section>

          <aside className={styles.reportPanel}>
            {reportData ? (
              <>
                <ReservationReport ref={reportRef} data={reportData} />
                <ReportActions reportRef={reportRef} />
              </>
            ) : (
              <div className={styles.emptyReport}>
                <span>ملخص الحجز</span>
                <p>املئي الحقول واضغطي عرض الملخص.</p>
              </div>
            )}
          </aside>
        </form>
      </section>
    </main>
  );
}