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
            <option value="">اختر / Select</option>
            <option value="تصوير إعلان">تصوير إعلان</option>
            <option value="جلسة شخصية">جلسة شخصية</option>
            <option value="تصوير تخرج">تصوير تخرج</option>
            <option value="تصوير عرسان">تصوير عرسان</option>
            <option value="تصوير منتجات">تصوير منتجات</option>
            <option value="أخرى">أخرى</option>
          </select>
        </label>

        {data.photography_type === "أخرى" && (
          <label className={styles.field}>
            تفاصيل نوع التصوير
            <input
              value={data.photography_other}
              onChange={(e) => update("photography_other", e.target.value)}
              placeholder="مثال: تصوير داخلي، محتوى تجاري، جلسة خاصة"
            />
          </label>
        )}

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
          <input value={`${PHOTOGRAPHY_PRICE_PER_HOUR}$`} readOnly />
        </label>
      </div>
    </>
  );
}
