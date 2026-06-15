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
    <div className={styles.twoCols}>
      <label className={styles.field}>
        <span>
          هل يوجد أطفال؟ / <small>Children?</small>
        </span>

        <select value={data.has_kids} onChange={(e) => update("has_kids", e.target.value)} required>
          <option value="">اختر / Select</option>
          <option value="نعم">نعم / Yes</option>
          <option value="لا">لا / No</option>
        </select>
      </label>
    </div>
  );
}
