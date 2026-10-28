import Image from "next/image";
import { timeWindowLabel } from "../../lib/exhibition/schedule";
import styles from "./booking.module.css";

export type ExhibitionTicketData = {
  booking: { id: string; booking_reference: string; full_name: string;
    visit_date: string; start_time: string; end_time: string;
    guest_count: number; status: string };
  qr: string | null;
  notification_status: string;
};

export default function ExhibitionTicket({ ticket }: { ticket: ExhibitionTicketData }) {
  const b = ticket.booking, confirmed = b.status === "confirmed";
  const date = new Intl.DateTimeFormat("ar-IQ", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Baghdad",
  }).format(new Date(b.visit_date + "T12:00:00Z"));
  return <article className={styles.exhibitionTicket} id="exhibition-ticket" tabIndex={-1} aria-labelledby="ticket-title">
    <header className={styles.ticketHeader}>
      <span className={styles.ticketEyebrow} lang="en" dir="ltr">HOUSE OF ANTIQUES</span>
      <span className={styles.ticketOrnament} aria-hidden="true">◇</span>
      <span className={styles.ticketStatus}>
        {confirmed && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>}
        {confirmed ? "حجز مؤكد" : "حجز ملغى"}
      </span>
      <h2 id="ticket-title">{confirmed ? "نتطلّع لاستقبالكم" : "الحجز ملغى"}</h2>
      <p>نعيمة وذاكرة بغداد</p>
      <span className={styles.ticketVenue}>بيت التحفيات · بغداد</span>
    </header>
    <div className={styles.ticketBody}>
      <div className={styles.ticketDetails}>
        <div className={styles.ticketGuest}><span>ضيفنا الكريم</span><h3>{b.full_name}</h3></div>
        <dl className={styles.ticketFacts}>
          <div><dt>تاريخ الزيارة</dt><dd>{date}</dd></div>
          <div><dt>الوقت · بتوقيت بغداد</dt><dd>{timeWindowLabel(b.start_time, b.end_time)}</dd></div>
          <div><dt>عدد الأشخاص</dt><dd>{b.guest_count}</dd></div>
        </dl>
        <div className={styles.ticketReference}><span>رقم الحجز</span><bdi>{b.booking_reference}</bdi></div>
      </div>
      <div className={styles.ticketQr}>
        {confirmed && ticket.qr ? <>
          <div className={styles.ticketQrFrame}><Image unoptimized src={ticket.qr} width={256} height={256} alt="رمز الحجز للتحقق عند الوصول" /></div>
          <strong>رمز الدخول الخاص بكم</strong>
          <p>احتفظوا بهذه التذكرة وأبرزوا الرمز<br />لفريق الاستقبال عند الوصول.</p>
        </> : <p>{confirmed ? "تعذر عرض الرمز. أعيدوا التحقق من الحجز لاستعادته." : "هذا الحجز غير صالح للدخول. يرجى التواصل مع بيت التحفيات."}</p>}
      </div>
    </div>
    <footer className={styles.ticketFooter}><span>أهلاً بكم في بيت التحفيات</span><span lang="en" dir="ltr">ABAAD EXHIBIT</span></footer>
  </article>;
}
