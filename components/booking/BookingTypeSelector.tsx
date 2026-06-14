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
    <div className={styles.typeGrid}>
      {bookingOptions.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`${styles.typeButton} ${
            value === item.id ? styles.activeType : ""
          }`}
          onClick={() => onChange(item.id)}
        >
          <span>{item.title}</span>
          <small>{item.soon ? "قريبًا" : item.en}</small>
        </button>
      ))}
    </div>
  );
}