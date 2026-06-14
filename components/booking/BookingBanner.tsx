import styles from "./booking.module.css";
import { bookingOptions, socialLinks } from "./bookingData";
import { BookingType } from "./bookingTypes";

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8h12l-1 13H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M6 8h12" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a8.7 8.7 0 0 0-7.4 13.3L3.8 21l4.9-1.2A8.7 8.7 0 1 0 12 3Z" />
      <path d="M8.8 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.4.5c-.1.1-.2.3 0 .5.4.8 1.2 1.7 2.1 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.6 0 .7-.5 1.6-1.2 1.9-.6.3-1.9.3-3.5-.6-2.7-1.4-4.3-3.8-4.6-5.4-.2-1 .2-2 .8-2.6Z" />
    </svg>
  );
}

function getIcon(label: string) {
  if (label === "Website") return <WebsiteIcon />;
  if (label === "Store") return <StoreIcon />;
  return <WhatsAppIcon />;
}

export default function BookingBanner({
  bookingType,
}: {
  bookingType: BookingType;
}) {
  const current = bookingOptions.find((item) => item.id === bookingType);

  return (
    <section className={styles.hero}>
      <div
        className={styles.heroImage}
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.28)), url(${current?.image})`,
        }}
      >
        <div className={styles.heroSocial} aria-label="House of Antiques Links">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              title={`${item.ar} / ${item.label}`}
            >
              {getIcon(item.label)}
              <span>{item.ar}</span>
            </a>
          ))}
        </div>

        <div className={styles.heroText} dir="rtl">
  <p>
  اختر نوع تجربتك <small dir="ltr">/ Choose Your Experience</small>
</p>
  <h2>{current?.title}</h2>
  <span dir="ltr">{current?.en}</span>
</div>
      </div>
    </section>
  );
}