import styles from "../booking.module.css";
import { BookingFormData } from "../bookingTypes";

export default function VisitFields({
  data,
  update,
}: {
  data: BookingFormData;
  update: (name: keyof BookingFormData, value: string) => void;
}) {
  const peopleCount = Number(data.people_count || 0);
  const showGroupType = peopleCount >= 4;

  return (
    <>
      {showGroupType && (
        <>
          <div className={styles.sectionTitle}>
            تفاصيل الزيارة / Visit Details
          </div>

          <div className={styles.twoCols}>
            <label className={styles.fieldWide}>
              <span>
                نوع الزوار / <small>Visitor Type</small>
              </span>

              <select
                value={data.group_type}
                onChange={(e) => update("group_type", e.target.value)}
              >
                <option value="">اختاري / Select</option>
                <option value="أصدقاء">أصدقاء / Friends</option>
                <option value="عائلة">عائلة / Family</option>
                <option value="زملاء">زملاء / Colleagues</option>
                <option value="مختلط">مختلط / Mixed</option>
              </select>
            </label>
          </div>
        </>
      )}
    </>
  );
}