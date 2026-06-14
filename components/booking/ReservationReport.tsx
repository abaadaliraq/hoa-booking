import { forwardRef } from "react";
import styles from "./booking.module.css";
import { BookingFormData } from "./bookingTypes";

function row(label: string, value?: string) {
  if (!value) return null;

  return (
    <div className={styles.reportRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const ReservationReport = forwardRef<HTMLDivElement, { data: BookingFormData }>(
  function ReservationReport({ data }, ref) {
    return (
      <div ref={ref} className={styles.reportCard}>
        <div className={styles.reportHeader}>
          <p>بيت التحفيات</p>
          <h2>تقرير الحجز</h2>
          <span>{data.booking_id}</span>
        </div>

        <div className={styles.reportSection}>
          {row("تاريخ الإرسال", data.created_at)}
          {row("نوع الحجز", data.event_type)}
          {row("تاريخ الحجز", data.booking_date)}
          {row("وقت البداية", data.start_time_ar || data.start_time)}
          {row("وقت النهاية", data.end_time_ar || data.end_time)}
          {row("عدد الساعات", data.duration_hours)}
          {row("عدد الأشخاص", data.people_count)}
        </div>

        <div className={styles.reportSection}>
          <h3>بيانات الزبون</h3>
          {row("الاسم", data.full_name)}
          {row("تاريخ الولادة", data.birthdate)}
          {row("الهاتف", data.phone)}
          {row("الإيميل", data.customer_email)}
          {row("يوجد أطفال؟", data.has_kids)}
          {row("عمر أصغر طفل", data.youngest_kid_age)}
        </div>

        <div className={styles.reportSection}>
          <h3>تفاصيل إضافية</h3>
          {row("نوع التصوير", data.photography_type)}
          {row("نوع تصوير آخر", data.photography_other)}
          {row("ساعات التصوير", data.photography_hours)}
          {row("نوع المناسبة", data.occasion_type)}
          {row("مناسبة أخرى", data.occasion_other)}
          {row("الديكور من", data.decor_provider)}
          {row("وجبات من بيت التحفيات", data.food_from_hoa)}
          {row("فرقة موسيقية", data.has_band)}
          {row("تفاصيل الفرقة", data.band_details)}
          {row("نوع الجلسة", data.restaurant_area)}
          {row("نوع حجز المطعم", data.restaurant_booking_type)}
          {row("ملاحظات الطعام", data.food_notes)}
          {row("موضوع الورشة", data.workshop_topic)}
          {row("الجهة المنظمة", data.organizer_name)}
          {row("تحتاج شاشة عرض", data.needs_projector)}
          {row("تحتاج مايكروفون", data.needs_microphone)}
          {row("نوع الزوار", data.group_type)}
          {row("أجانب", data.is_foreign)}
          {row("الدولة", data.country)}
          {row("المحافظة", data.province)}
          {row("الاهتمامات", data.interests)}
        </div>

        <div className={styles.reportSection}>
          <h3>الدفع</h3>
          {row("الدفع مطلوب", data.payment_required)}
          {row("طريقة الدفع", data.payment_method)}
          {row("سعر الشخص", data.payment_per_person)}
          {row("الإجمالي", data.payment_total)}
          {row("رقم البطاقة", data.payment_card_number)}
          {row("مرجع الدفع", data.payment_ref)}
          {row("ملاحظة الدفع", data.payment_notice)}
        </div>

        {data.notes && (
          <div className={styles.reportNotes}>
            <h3>ملاحظات</h3>
            <p>{data.notes}</p>
          </div>
        )}
      </div>
    );
  }
);

export default ReservationReport;