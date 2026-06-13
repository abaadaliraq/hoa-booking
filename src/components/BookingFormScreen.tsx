"use client";

import { useState } from "react";
import HospitalityForm from "@/components/forms/HospitalityForm";
import OccasionForm from "@/components/forms/OccasionForm";
import PhotoSessionForm from "@/components/forms/PhotoSessionForm";
import TourForm from "@/components/forms/TourForm";
import VisitForm from "@/components/forms/VisitForm";
import { langLabels, langs } from "@/data/bookingContent";
import type { BookingContent, BookingForm, BookingType, Lang } from "@/types/booking";

type Props = {
  lang: Lang;
  type: BookingType;
  form: BookingForm;
  content: BookingContent;
  update: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  onLangChange: (lang: Lang) => void;
  onBack: () => void;
};

const EMAILJS_SERVICE_ID = "service_bm4mbb9";
const EMAILJS_PUBLIC_KEY = "tivoinl7MHIKAOORE";
const EMAILJS_TEMPLATE_ID = "template_booking_request";

function hasText(value: string) {
  return value.trim().length > 0;
}

export default function BookingFormScreen({
  lang,
  type,
  form,
  content,
  update,
  onLangChange,
  onBack,
}: Props) {
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const booking = content.types[type];

  const isValid =
    hasText(form.fullName) &&
    hasText(form.phone) &&
    hasText(form.date) &&
    hasText(form.time) &&
    form.guests > 0;

  function add(lines: string[], label: string, value: unknown) {
    if (value === "" || value === null || value === undefined) return;
    if (typeof value === "boolean") {
      lines.push(`${label}: ${value ? content.options.yes : content.options.no}`);
      return;
    }
    lines.push(`${label}: ${value}`);
  }

  function bookingMessage() {
    const lines = [booking.title, "----------------"];
    add(lines, content.labels.fullName, form.fullName);
    add(lines, content.labels.phone, form.phone);
    add(lines, content.labels.email, form.email);
    add(lines, content.labels.birthdate, form.birthdate);
    add(lines, content.labels.guests, form.guests);
    add(lines, content.labels.hasChildren, form.hasChildren);
    if (form.hasChildren) add(lines, content.labels.childrenCount, form.childrenCount);
    add(lines, content.labels.isForeign, form.isForeign);
    add(lines, content.labels.country, form.country);
    add(lines, content.labels.province, form.province);
    add(lines, content.labels.date, form.date);
    add(lines, content.labels.time, form.time);
    add(lines, content.labels.tourType, form.tourType);
    add(lines, content.labels.tourLanguage, form.tourLanguage);
    add(lines, content.labels.occasionType, form.occasionType);
    add(lines, content.labels.occasionOther, form.occasionOther);
    add(lines, content.labels.endTime, form.endTime);
    add(lines, content.labels.durationHours, form.durationHours);
    add(lines, content.labels.decorProvider, form.decorProvider);
    add(lines, content.labels.foodProvider, form.foodProvider);
    add(lines, content.labels.foodNotes, form.foodNotes);
    add(lines, content.labels.hasBand, form.hasBand);
    add(lines, content.labels.bandDetails, form.bandDetails);
    add(lines, content.labels.hasPhotography, form.hasPhotography);
    add(lines, content.labels.needsSpecialSetup, form.needsSpecialSetup);
    add(lines, content.labels.hospitalityType, form.hospitalityType);
    add(lines, content.labels.dietaryNotes, form.dietaryNotes);
    add(lines, content.labels.notes, form.notes);
    return lines.join("\n");
  }

  async function send() {
    setSendState("sending");
    const details = bookingMessage();

    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            booking_type: booking.title,
            customer_name: form.fullName,
            customer_phone: form.phone,
            booking_date: form.date,
            booking_time: form.time,
            booking_details: details,
            message: details,
            reply_to: form.email || "booking@house-of-antiques.local",
          },
        }),
      });

      if (!response.ok) throw new Error("EmailJS request failed");
      setSendState("sent");
    } catch {
      setSendState("error");
    }
  }

  return (
    <section
      className="relative min-h-screen overflow-y-auto bg-[#120d0a] px-5 pb-8 pt-5 text-[#fff8ea]"
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <div
        key={booking.image}
        className="absolute inset-0 bg-cover bg-center animate-[heroFade_420ms_ease-out]"
        style={{ backgroundImage: `url('${booking.image}')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0, 0, 0, 0.44)_0%,rgba(18,13,10,0.9)_38%,rgba(18,13,10,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[#120d0a]/65 backdrop-blur-[1px]" />

      <div className="relative z-10 animate-[stepIn_320ms_ease-out]">
        <header className="mb-5 flex items-center justify-between" dir="ltr">
          <button
            type="button"
            onClick={onBack}
            aria-label={content.back}
            className="text-2xl text-[#f1c982]"
          >
            {lang === "en" ? "<" : ">"}
          </button>
          <div className="flex rounded-full bg-[#120d0a]/45 p-1 text-[11px] backdrop-blur-md">
            {langs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLangChange(item)}
                className={`rounded-full px-2.5 py-1.5 transition ${
                  lang === item
                    ? "bg-[#d8a45f] text-[#120d0a]"
                    : "text-[#f2d8b2]"
                }`}
              >
                {langLabels[item]}
              </button>
            ))}
          </div>
          <span className="text-[11px] tracking-[0.28em] text-[#f1c982]">
            HOA
          </span>
        </header>

        <p className="text-xs uppercase tracking-[0.28em] text-[#d8a45f]">
          {booking.shortTitle}
        </p>
        <h1 className="mt-2 text-[34px] font-medium leading-tight">
          {booking.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#d8c0a0]">
          {booking.subtitle}
        </p>

        <div className="mt-5">
          {type === "visit" && <VisitForm form={form} lang={lang} content={content} update={update} />}
          {type === "tour" && <TourForm form={form} lang={lang} content={content} update={update} />}
          {type === "photoSession" && <PhotoSessionForm form={form} lang={lang} content={content} update={update} />}
          {type === "occasion" && <OccasionForm form={form} lang={lang} content={content} update={update} />}
          {type === "hospitality" && <HospitalityForm form={form} lang={lang} content={content} update={update} />}
        </div>

        <button
          type="button"
          disabled={!isValid || sendState === "sending"}
          onClick={send}
          className="mt-6 w-full rounded-full bg-[#d8a45f] px-5 py-4 text-sm font-medium text-[#120d0a] transition disabled:bg-white/[0.12] disabled:text-[#9f8467]"
        >
          {sendState === "sending" ? "Sending..." : content.sendRequest}
        </button>

        {sendState === "sent" && (
          <p className="mt-3 text-center text-xs text-[#f1c982]">
            تم إرسال تفاصيل الحجز بنجاح
          </p>
        )}
        {sendState === "error" && (
          <p className="mt-3 text-center text-xs text-[#f1a982]">
            تعذر الإرسال. تأكد من Template ID في EmailJS.
          </p>
        )}
      </div>
    </section>
  );
}
