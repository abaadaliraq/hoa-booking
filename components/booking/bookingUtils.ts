import { BookingFormData, BookingType } from "./bookingTypes";
import {
  CARD_NUMBER,
  PHOTOGRAPHY_PRICE_PER_HOUR,
  VISIT_PRICE_PER_PERSON,
} from "./bookingData";

export function makeBookingId() {
  return `HOA-${Date.now().toString().slice(-8)}`;
}

export function nowText() {
  return new Date().toLocaleString("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function timeToArabic(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("ar-IQ", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function calculateDuration(start: string, end: string) {
  if (!start || !end) return "";

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) return "";

  const hours = (endMinutes - startMinutes) / 60;
  return String(hours);
}

export function getEventTypeName(type: BookingType) {
  const names: Record<BookingType, string> = {
    visit: "زيارة",
    restaurant: "حجز مطعم",
    photography: "جلسة تصوير",
    occasion: "إقامة مناسبة",
    workshop: "ورشة / ندوة",
    auction: "مزاد",
    exhibition: "معرض",
  };

  return names[type];
}

export function calculatePayment(type: BookingType, data: BookingFormData) {
  const people = Number(data.people_count || 0);
  const photoHours = Number(data.photography_hours || 0);

  if (type === "visit") {
    return {
      payment_required: "نعم",
      payment_per_person: `${VISIT_PRICE_PER_PERSON}`,
      payment_total: `${people * VISIT_PRICE_PER_PERSON}`,
      payment_card_number: CARD_NUMBER,
    };
  }

  if (type === "photography") {
    return {
      payment_required: "نعم",
      payment_per_person: "—",
      payment_total: `${photoHours * PHOTOGRAPHY_PRICE_PER_HOUR}`,
      payment_card_number: CARD_NUMBER,
    };
  }

  if (type === "restaurant") {
    return {
      payment_required: "لا / يتم التأكيد بعد التواصل",
      payment_per_person: "—",
      payment_total: "يتم الاتفاق بعد التواصل",
      payment_card_number: CARD_NUMBER,
    };
  }

  return {
    payment_required: "يتم الاتفاق بعد التواصل",
    payment_per_person: "—",
    payment_total: "يتم الاتفاق بعد التواصل",
    payment_card_number: CARD_NUMBER,
  };
}