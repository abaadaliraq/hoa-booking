import styles from "./booking.module.css";
import { bookingOptions } from "./bookingData";
import { BookingType } from "./bookingTypes";

export default function BookingTypeSelector({
  value,
  onChange,
}: {
  value: BookingType;
  onChange: (value: BookingType) => void;
}) {
  return (
    <div className={styles.bookingTypeSelectWrap}>
      <label className={styles.fieldWide}>
        <span>
          اختر نوع الحجز / <small>Choose Your Experience</small>
        </span>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value as BookingType)}
        >
          {bookingOptions.map((option) => (
            <option
              key={option.id}
              value={option.id}
              disabled={option.soon}
            >
              {option.title} / {option.en}
              {option.soon ? " - قريبًا" : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}