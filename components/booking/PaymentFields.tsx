import styles from "./booking.module.css";
import { BookingFormData } from "./bookingTypes";

export default function PaymentFields({
  data,
  update,
  payment,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
  payment: {
    payment_required: string;
    payment_per_person: string;
    payment_total: string;
    payment_card_number: string;
  };
}) {
  return (
    <>
      <div className={styles.sectionTitle}>تفاصيل الدفع</div>

      <div className={styles.paymentBox}>
        <div>
          <span>الدفع مطلوب؟</span>
          <strong>{payment.payment_required}</strong>
        </div>

        <div>
          <span>سعر الشخص</span>
          <strong>{payment.payment_per_person}</strong>
        </div>

        <div>
          <span>الإجمالي</span>
          <strong>{payment.payment_total}</strong>
        </div>

        <div>
          <span>رقم البطاقة</span>
          <strong dir="ltr">{payment.payment_card_number}</strong>
        </div>
      </div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          طريقة الدفع
          <select
            value={data.payment_method}
            onChange={(e) => update("payment_method", e.target.value)}
          >
            <option value="">اختاري</option>
            <option value="تحويل إلى بطاقة الماستر كارد">
              تحويل إلى بطاقة الماستر كارد
            </option>
          </select>
        </label>

        <label className={styles.field}>
          مرجع الدفع
          <input
            value={data.payment_ref}
            onChange={(e) => update("payment_ref", e.target.value)}
          />
        </label>

        <label className={styles.fieldWide}>
          ملاحظة الدفع
          <input
            value={data.payment_notice}
            onChange={(e) => update("payment_notice", e.target.value)}
          />
        </label>
      </div>
    </>
  );
}