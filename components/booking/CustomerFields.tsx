import styles from "./booking.module.css";
import { BookingFormData } from "./bookingTypes";

export default function CustomerFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>بيانات الزبون / Customer Details</div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          <span>
            الاسم الكامل / <small>Full Name</small>
          </span>

          <input
            value={data.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>
            تاريخ الولادة / <small>Date of Birth</small>
          </span>

          <input
            type="date"
            value={data.birthdate}
            onChange={(e) => update("birthdate", e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>
            الهاتف / <small>Phone</small>
          </span>

          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>
            الإيميل / <small>Email</small>
          </span>

          <input
            type="email"
            value={data.customer_email}
            onChange={(e) => update("customer_email", e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>
            هل يوجد أطفال؟ / <small>Children?</small>
          </span>

          <select
            value={data.has_kids}
            onChange={(e) => {
              update("has_kids", e.target.value);

              if (e.target.value !== "نعم") {
                update("youngest_kid_age", "");
              }
            }}
            required
          >
            <option value="">اختاري / Select</option>
            <option value="نعم">نعم / Yes</option>
            <option value="لا">لا / No</option>
          </select>
        </label>

        {data.has_kids === "نعم" && (
          <label className={styles.field}>
            <span>
              عمر أصغر طفل / <small>Youngest Child Age</small>
            </span>

            <input
              type="number"
              min="0"
              max="17"
              value={data.youngest_kid_age}
              onChange={(e) => update("youngest_kid_age", e.target.value)}
              required
            />
          </label>
        )}

        <label className={styles.fieldWide}>
          <span>
            ملاحظات / <small>Notes</small>
          </span>

          <textarea
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
          />
        </label>
      </div>
    </>
  );
}