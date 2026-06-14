import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";
import { PHOTOGRAPHY_PRICE_PER_HOUR } from "../bookingData";

export default function PhotographyFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل جلسة التصوير</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          نوع التصوير
          <select value={data.photography_type} onChange={(e) => update("photography_type", e.target.value)}>
            <option value="">اختاري</option>
            <option value="شركة">شركة</option>
            <option value="عرسان">عرسان</option>
            <option value="شخصي">شخصي</option>
            <option value="منتجات">منتجات</option>
            <option value="أخرى">أخرى</option>
          </select>
        </label>

        <label className={styles.field}>
          عدد الساعات
          <input
            type="number"
            min="1"
            value={data.photography_hours}
            onChange={(e) => update("photography_hours", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          سعر الساعة
          <input value={PHOTOGRAPHY_PRICE_PER_HOUR} readOnly />
        </label>
      </div>
    </>
  );
}