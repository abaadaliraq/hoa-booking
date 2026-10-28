"use client";
import { useEffect, useState } from "react";
import BookingBanner from "./BookingBanner";
import ExhibitionVisit from "./ExhibitionVisit";
import { exhibitionDates, visitMode } from "../../lib/exhibition/domain";
import styles from "./booking.module.css";
export default function BookingApp() {
  const [date, setDate] = useState<string>(exhibitionDates.first);
  const [count, setCount] = useState("1");
  const [locked, setLocked] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem("abaad_exhibition_request") || "null");
        if (saved?.payload && visitMode(saved.payload.visit_date) === "exhibition" && Number.isInteger(saved.payload.guest_count)) {
          setDate(saved.payload.visit_date); setCount(String(saved.payload.guest_count)); setLocked(true);
        }
      } catch { /* Browser storage is optional; existing pending requests stay idempotent. */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return <main className={styles.page}>
    <section className={styles.shell}>
      <header className={styles.header}><div className={styles.brandTitle}><span>بيت التحفيات</span><small>House of Antiques</small></div></header>
      {!showTicket && <BookingBanner bookingType="exhibition" />}
      <div className={`${styles.formGrid} ${styles.exhibitionOnly}`}>
        <section className={styles.formPanel} aria-label="حجز المعرض">
          {!showTicket && <>
          <div className={styles.sectionTitle}>حجز المعرض / Exhibition Booking</div>
          <p className={styles.exhibitionHours}>31 أكتوبر – 9 نوفمبر 2026 · من 5 عصراً إلى 9 مساءً</p>
          <div className={styles.twoCols}>
            <label className={styles.field}><span>تاريخ الزيارة / <small>Date</small></span>
              <input type="date" min={exhibitionDates.first} max={exhibitionDates.last} value={date} disabled={locked} onChange={e => setDate(e.target.value)} required />
            </label>
            <label className={styles.field}><span>عدد الأشخاص / <small>Guests</small></span>
              <input type="number" min="1" max="60" value={count} disabled={locked} onChange={e => setCount(e.target.value)} required />
            </label>
          </div>
          </>}
          <ExhibitionVisit date={date} count={count} onLock={setLocked} onTicket={setShowTicket} />
        </section>
      </div>
    </section>
  </main>;
}
