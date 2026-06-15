import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";

export default function WorkshopFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل الورشة / الندوة</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          موضوع الورشة
          <input value={data.workshop_topic} onChange={(e) => update("workshop_topic", e.target.value)} />
        </label>

        <label className={styles.field}>
          اسم الجهة المنظمة
          <input value={data.organizer_name} onChange={(e) => update("organizer_name", e.target.value)} />
        </label>

        <label className={styles.field}>
          تحتاج شاشة عرض؟
          <select value={data.needs_projector} onChange={(e) => update("needs_projector", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </label>

        <label className={styles.field}>
          تحتاج مايكروفون؟
          <select value={data.needs_microphone} onChange={(e) => update("needs_microphone", e.target.value)}>
            <option value="">اختر / Select</option>
            <option value="نعم">نعم</option>
            <option value="لا">لا</option>
          </select>
        </label>
      </div>
    </>
  );
}
