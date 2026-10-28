import { BookingType } from "./bookingTypes";

export const MASTER_CARD_NUMBER = "7146148577";
export const CARD_NUMBER = MASTER_CARD_NUMBER;
export const WHATSAPP_BOOKING_PHONE = "9647777045599";

export const VISIT_PRICE_PER_PERSON = 15;
export const PHOTOGRAPHY_PRICE_PER_HOUR = 400;

export const socialLinks: {
  label: "Website" | "Store" | "WhatsApp";
  ar: string;
  href: string;
}[] = [
  {
    label: "Website",
    ar: "الموقع",
    href: "https://houseof-antiques.com",
  },
  {
    label: "Store",
    ar: "المتجر",
    href: "https://houseofantiques.store",
  },
  {
    label: "WhatsApp",
    ar: "واتساب",
    href: `https://wa.me/${WHATSAPP_BOOKING_PHONE}`,
  },
];

export const bookingOptions: { id: BookingType; title: string; en: string; soon?: boolean; image: string }[] = [
  { id: "exhibition", title: "نعيمة وذاكرة بغداد", en: "Naima & the Memory of Baghdad", image: "/images/booking/exhibition.jpg" },
];
