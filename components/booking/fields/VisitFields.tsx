import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";

export default function VisitFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل الزيارة</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          نوع الزوار
          <select value={data.group_type} onChange={(e) => update("group_type", e.target.value)}>
            <option value="">اختاري</option>
            <option value="أصدقاء">أصدقاء</option>
            <option value="عائلة">عائلة</option>
            <option value="زملاء">زملاء</option>
            <option value="مختلط">مختلط</option>
          </select>
        </label>

        <label className={styles.fieldWide}>
          الاهتمامات
          <input
            value={data.interests}
            onChange={(e) => update("interests", e.target.value)}
          />
        </label>
      </div>
    </>
  );
}