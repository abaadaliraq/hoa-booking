import styles from "./booking.module.css";
import { BookingFormData } from "./bookingTypes";

export default function GroupFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل المجموعة</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          نوع الزوار
          <select
            value={data.group_type}
            onChange={(e) => update("group_type", e.target.value)}
          >
            <option value="">اختر / Select</option>
            <option value="أصدقاء">أصدقاء</option>
            <option value="عائلة">عائلة</option>
            <option value="زملاء">زملاء</option>
            <option value="مختلط">مختلط</option>
          </select>
        </label>

        <label className={styles.field}>
          أجانب؟
          <select
            value={data.is_foreign}
            onChange={(e) => update("is_foreign", e.target.value)}
          >
            <option value="">اختر / Select</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </label>

        {data.is_foreign === "نعم" && (
          <label className={styles.field}>
            الدولة
            <input
              value={data.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </label>
        )}

        {data.is_foreign === "لا" && (
          <label className={styles.field}>
            المحافظة
            <input
              value={data.province}
              onChange={(e) => update("province", e.target.value)}
            />
          </label>
        )}

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
