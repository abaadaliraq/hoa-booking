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

export const bookingOptions: {
  id: BookingType;
  title: string;
  en: string;
  soon?: boolean;
  image: string;
}[] = [
  {
    id: "visit",
    title: "زيارة",
    en: "Visit",
    image: "/images/booking/visit.jpg",
  },
  {
  id: "restaurant",
  title: "حجز مطعم",
  en: "Restaurant",
  soon: true,
  image: "/images/booking/restaurant.jpg",
},
  {
    id: "photography",
    title: "جلسة تصوير",
    en: "Photography",
    image: "/images/booking/photography.jpg",
  },
  {
    id: "occasion",
    title: "إقامة مناسبة",
    en: "Private Occasion",
    image: "/images/booking/occasion.jpg",
  },
  {
    id: "workshop",
    title: "ورشة / ندوة",
    en: "Workshop / Seminar",
    image: "/images/booking/workshop.jpg",
  },
  {
    id: "auction",
    title: "مزاد",
    en: "Auction",
    soon: true,
    image: "/images/booking/auction.jpg",
  },
  {
    id: "exhibition",
    title: "معرض",
    en: "Exhibition",
    soon: true,
    image: "/images/booking/exhibition.jpg",
  },
];
