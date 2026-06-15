import styles from "./booking.module.css";
import { BookingFormData } from "./bookingTypes";
import { MASTER_CARD_NUMBER } from "./bookingData";

export default function PaymentFields({
  data,
  update,
  payment,
  priceLabel = "سعر الشخص",
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
  payment: {
    payment_required: string;
    payment_per_person: string;
    payment_total: string;
    payment_card_number: string;
  };
  priceLabel?: string;
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل الدفع</div>

      <div className={styles.paymentBox}>
        <div>
          <span>{priceLabel}</span>
          <strong>{payment.payment_per_person}$</strong>
        </div>

        <div>
          <span>الإجمالي</span>
          <strong>{payment.payment_total}$</strong>
        </div>
      </div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          طريقة الدفع
          <select
            value={data.payment_method}
            onChange={(e) => update("payment_method", e.target.value)}
          >
            <option value="">اختر طريقة الدفع</option>
            <option value="ماستر كارد">ماستر كارد</option>
            <option value="زين كاش">زين كاش</option>
            <option value="عند الوصول / اختياري">عند الوصول / اختياري</option>
          </select>
        </label>

        {data.payment_method === "ماستر كارد" && (
          <div className={styles.fieldWide}>
            <span>رقم بطاقة الماستر كارد للتحويل:</span>
            <strong dir="ltr">{MASTER_CARD_NUMBER}</strong>
          </div>
        )}
      </div>
    </>
  );
}
