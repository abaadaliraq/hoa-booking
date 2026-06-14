import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";

export default function RestaurantFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل حجز المطعم</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          نوع الجلسة
          <select value={data.restaurant_area} onChange={(e) => update("restaurant_area", e.target.value)}>
            <option value="">اختاري</option>
            <option value="داخلية">داخلية</option>
            <option value="خارجية">خارجية</option>
            <option value="حسب المتاح">حسب المتاح</option>
          </select>
        </label>

        <label className={styles.field}>
          نوع الطلب
          <select value={data.restaurant_booking_type} onChange={(e) => update("restaurant_booking_type", e.target.value)}>
            <option value="">اختاري</option>
            <option value="فطور">فطور</option>
            <option value="غداء">غداء</option>
            <option value="عشاء">عشاء</option>
            <option value="جلسة شاي">جلسة شاي</option>
            <option value="حجز خاص">حجز خاص</option>
          </select>
        </label>

        <label className={styles.fieldWide}>
          ملاحظات الطعام
          <input value={data.food_notes} onChange={(e) => update("food_notes", e.target.value)} />
        </label>
      </div>
    </>
  );
}