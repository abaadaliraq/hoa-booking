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
import { MASTER_CARD_NUMBER, PHOTOGRAPHY_PRICE_PER_HOUR } from "./bookingData";

import BookingBanner from "./BookingBanner";
import BookingTypeSelector from "./BookingTypeSelector";
import CustomerFields from "./CustomerFields";
import GroupFields from "./GroupFields";
import PaymentFields from "./PaymentFields";
import ReservationReport from "./ReservationReport";
import ReportActions from "./ReportActions";

import VisitFields from "./fields/VisitFields";
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

  const isVisit = bookingType === "visit";
  const isPhotography = bookingType === "photography";
  const needsTimeRange = !isVisit && !isPhotography;

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
        next.duration_hours = calculateDuration(next.start_time, next.end_time);
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

      start_time: isPhotography ? "" : data.start_time,
      start_time_ar: isPhotography ? "" : timeToArabic(data.start_time),
      end_time: isVisit || isPhotography ? "" : data.end_time,
      end_time_ar: isVisit || isPhotography ? "" : timeToArabic(data.end_time),
      duration_hours: isPhotography
        ? data.photography_hours
        : isVisit
          ? ""
          : calculateDuration(data.start_time, data.end_time),

      payment_required: payment.payment_required,
      payment_per_person: payment.payment_per_person,
      payment_total: payment.payment_total,
      payment_card_number:
        data.payment_method === "ماستر كارد" ? MASTER_CARD_NUMBER : "-",
      photography_price_per_hour:
        bookingType === "photography" ? `${PHOTOGRAPHY_PRICE_PER_HOUR}` : data.photography_price_per_hour,
    };

    return finalData;
  }

  function valueOrFallback(value: string | number | undefined | null) {
    const normalized = String(value ?? "").trim();
    return normalized || "-";
  }

  function buildBookingSummary(finalData: BookingFormData) {
    return [
      `رقم الحجز: ${valueOrFallback(finalData.booking_id)}`,
      `نوع الحجز: ${valueOrFallback(finalData.event_type)}`,
      `عدد الأشخاص: ${valueOrFallback(finalData.people_count)}`,
      `الاسم الكامل: ${valueOrFallback(finalData.full_name)}`,
      `رقم الهاتف: ${valueOrFallback(finalData.phone)}`,
      `تاريخ الحجز: ${valueOrFallback(finalData.booking_date)}`,
      `ساعة الزيارة: ${valueOrFallback(finalData.start_time_ar || finalData.start_time)}`,
      `هل يوجد أطفال: ${valueOrFallback(finalData.has_kids)}`,
      `نوع التصوير: ${valueOrFallback(finalData.photography_type)}`,
      `تفاصيل نوع التصوير: ${valueOrFallback(finalData.photography_other)}`,
      `عدد ساعات التصوير: ${valueOrFallback(finalData.photography_hours)}`,
      `سعر ساعة التصوير: ${valueOrFallback(finalData.photography_price_per_hour)}`,
      `سعر الشخص: ${valueOrFallback(finalData.payment_per_person)}`,
      `المجموع: ${valueOrFallback(finalData.payment_total)}`,
      `طريقة الدفع: ${valueOrFallback(finalData.payment_method)}`,
      `رقم بطاقة التحويل: ${valueOrFallback(finalData.payment_card_number)}`,
      `ملاحظات: ${valueOrFallback(finalData.notes)}`,
    ].join("\n");
  }

  function buildTemplateParams(finalData: BookingFormData) {
    const summary = buildBookingSummary(finalData);

    return {
      booking_id: valueOrFallback(finalData.booking_id),
      created_at: valueOrFallback(finalData.created_at),
      event_type: valueOrFallback(finalData.event_type),
      people_count: valueOrFallback(finalData.people_count),
      booking_date: valueOrFallback(finalData.booking_date),
      start_time: valueOrFallback(finalData.start_time),
      visit_time: valueOrFallback(finalData.start_time),
      start_time_ar: valueOrFallback(finalData.start_time_ar),
      visit_time_ar: valueOrFallback(finalData.start_time_ar),
      end_time: valueOrFallback(finalData.end_time),
      end_time_ar: valueOrFallback(finalData.end_time_ar),
      duration_hours: valueOrFallback(finalData.duration_hours),
      full_name: valueOrFallback(finalData.full_name),
      birthdate: valueOrFallback(finalData.birthdate),
      phone: valueOrFallback(finalData.phone),
      has_kids: valueOrFallback(finalData.has_kids),
      youngest_kid_age: valueOrFallback(finalData.youngest_kid_age),
      photography_type: valueOrFallback(finalData.photography_type),
      photography_other: valueOrFallback(finalData.photography_other),
      photography_hours: valueOrFallback(finalData.photography_hours),
      photography_price_per_hour: valueOrFallback(finalData.photography_price_per_hour),
      payment_required: valueOrFallback(finalData.payment_required),
      payment_method: valueOrFallback(finalData.payment_method),
      payment_per_person: valueOrFallback(finalData.payment_per_person),
      payment_total: valueOrFallback(finalData.payment_total),
      payment_card_number: valueOrFallback(finalData.payment_card_number),
      payment_ref: valueOrFallback(finalData.payment_ref),
      payment_notice: valueOrFallback(finalData.payment_notice),
      occasion_type: valueOrFallback(finalData.occasion_type),
      occasion_other: valueOrFallback(finalData.occasion_other),
      decor_provider: valueOrFallback(finalData.decor_provider),
      food_from_hoa: valueOrFallback(finalData.food_from_hoa),
      has_band: valueOrFallback(finalData.has_band),
      band_details: valueOrFallback(finalData.band_details),
      group_type: valueOrFallback(finalData.group_type),
      is_foreign: valueOrFallback(finalData.is_foreign),
      country: valueOrFallback(finalData.country),
      province: valueOrFallback(finalData.province),
      interests: valueOrFallback(finalData.interests),
      restaurant_area: valueOrFallback(finalData.restaurant_area),
      restaurant_booking_type: valueOrFallback(finalData.restaurant_booking_type),
      food_notes: valueOrFallback(finalData.food_notes),
      workshop_topic: valueOrFallback(finalData.workshop_topic),
      organizer_name: valueOrFallback(finalData.organizer_name),
      needs_projector: valueOrFallback(finalData.needs_projector),
      needs_microphone: valueOrFallback(finalData.needs_microphone),
      notes: valueOrFallback(finalData.notes),
      message: summary,
      summary,
    };
  }

  function validateBeforeSubmit() {
    if (isSoon) {
      return "هذا النوع من الحجز سيتوفر قريبًا.";
    }

    if (!data.people_count || Number(data.people_count) < 1) {
      return "أدخل عدد الأشخاص بشكل صحيح.";
    }

    if (isVisit) {
      if (!data.booking_date) {
        return "حدد تاريخ الزيارة.";
      }

      if (!data.start_time) {
        return "حدد ساعة الزيارة.";
      }

      if (!data.has_kids) {
        return "حدد هل يوجد أطفال.";
      }

      if (!data.full_name.trim()) {
        return "أدخل الاسم الكامل.";
      }

      if (!data.phone.trim()) {
        return "أدخل رقم الهاتف.";
      }

      return "";
    }

    if (isPhotography) {
      if (!data.booking_date) {
        return "حدد تاريخ التصوير.";
      }

      if (!data.photography_hours || Number(data.photography_hours) < 1) {
        return "أدخل عدد ساعات التصوير.";
      }

      if (!data.photography_type) {
        return "اختر نوع التصوير.";
      }

      if (!data.full_name.trim()) {
        return "أدخل الاسم الكامل.";
      }

      if (!data.phone.trim()) {
        return "أدخل رقم الهاتف.";
      }

      return "";
    }

    if (!data.booking_date) {
      return "حدد تاريخ الحجز.";
    }

    if (!data.start_time) {
      return "حدد وقت البداية.";
    }

    if (!data.end_time) {
      return "حدد وقت النهاية.";
    }

    if (!calculateDuration(data.start_time, data.end_time)) {
      return "وقت النهاية لازم يكون بعد وقت البداية.";
    }

    if (!data.full_name.trim()) {
      return "أدخل الاسم الكامل.";
    }

    if (!data.phone.trim()) {
      return "أدخل رقم الهاتف.";
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
        "إعدادات EmailJS ناقصة. يجب التأكد من أسماء المتغيرات داخل .env.local و Vercel."
      );
      return;
    }

    try {
      setSending(true);
      setStatus("جاري إرسال طلب الحجز...");

      const templateParams = buildTemplateParams(finalData);

      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });

      setStatus("تم إرسال طلب الحجز بنجاح.");
    } catch (error) {
      console.error("EmailJS booking send failed:", error);
      setStatus("فشل إرسال الحجز. يرجى التأكد من إعدادات EmailJS أو المحاولة مرة ثانية، وتم تسجيل سبب الخطأ في Console.");
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
                      {isVisit
                        ? "تاريخ الزيارة"
                        : isPhotography
                          ? "تاريخ التصوير"
                          : "التاريخ"}{" "}
                      / <small>Date</small>
                    </span>

                    <input
                      type="date"
                      value={data.booking_date}
                      onChange={(e) => update("booking_date", e.target.value)}
                      required
                    />
                  </label>

                  {isVisit && (
                    <label className={styles.field}>
                      <span>
                        ساعة الزيارة / <small>Visit Time</small>
                      </span>

                      <input
                        type="time"
                        value={data.start_time}
                        onChange={(e) => update("start_time", e.target.value)}
                        required
                      />
                    </label>
                  )}

                  {needsTimeRange && (
                    <>
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
                    </>
                  )}
                </div>

                {needsTimeRange && data.start_time && data.end_time && !data.duration_hours && (
                  <p className={styles.warning}>
                    وقت النهاية لازم يكون بعد وقت البداية.
                  </p>
                )}

                {bookingType === "visit" && (
                  <VisitFields data={data} update={update} />
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

                {!isVisit && peopleCount >= 4 && (
                  <GroupFields data={data} update={update} />
                )}

                <CustomerFields data={data} update={update} basicOnly={isVisit} />

                {(bookingType === "visit" || bookingType === "photography") && (
                  <PaymentFields
                    data={data}
                    update={update}
                    payment={payment}
                    priceLabel={bookingType === "photography" ? "سعر الساعة" : "سعر الشخص"}
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
                <p>أدخل بيانات الحجز ثم اضغط عرض الملخص.</p>
              </div>
            )}
          </aside>
        </form>
      </section>
    </main>
  );
}
