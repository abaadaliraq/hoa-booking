import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";

export default function OccasionFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل المناسبة</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          نوع المناسبة
          <select value={data.occasion_type} onChange={(e) => update("occasion_type", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="خطوبة">خطوبة</option>
            <option value="مهر">مهر</option>
            <option value="عيد ميلاد">عيد ميلاد</option>
            <option value="تخرج">تخرج</option>
            <option value="ذكرى زواج">ذكرى زواج</option>
            <option value="حفل عائلي">حفل عائلي</option>
            <option value="حفل شركة">حفل شركة</option>
            <option value="أخرى">أخرى</option>
          </select>
        </label>

        <label className={styles.field}>
          الديكور من
          <select value={data.decor_provider} onChange={(e) => update("decor_provider", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="بيت التحفيات">بيت التحفيات</option>
            <option value="الجهة الحاجزة">الجهة الحاجزة</option>
            <option value="طرف ثالث">طرف ثالث</option>
          </select>
        </label>

        <label className={styles.field}>
          وجبات من بيت التحفيات؟
          <select value={data.food_from_hoa} onChange={(e) => update("food_from_hoa", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </label>

        <label className={styles.field}>
          فرقة موسيقية؟
          <select value={data.has_band} onChange={(e) => update("has_band", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </label>

        {data.has_band === "نعم" && (
          <label className={styles.fieldWide}>
            نوع الفرقة / تفاصيل الفرقة
            <input
              value={data.band_details}
              onChange={(e) => update("band_details", e.target.value)}
              placeholder="مثال: فرقة بغدادية، غناء فقط، موسيقى فقط، عزف شرقي"
            />
          </label>
        )}
      </div>
    </>
  );
}
