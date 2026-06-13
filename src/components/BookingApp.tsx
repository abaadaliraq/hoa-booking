"use client";

import { Cormorant_Garamond, Noto_Kufi_Arabic } from "next/font/google";
import { useState } from "react";
import BookingFormScreen from "@/components/BookingFormScreen";
import LandingScreen from "@/components/LandingScreen";
import { bookingContent } from "@/data/bookingContent";
import type { BookingForm, BookingStep, BookingType, Lang } from "@/types/booking";

const arabicFont = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

const latinFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const initialForm: BookingForm = {
  fullName: "",
  phone: "",
  email: "",
  birthdate: "",
  guests: 1,
  childrenCount: 0,
  hasChildren: null,
  isForeign: null,
  country: "",
  province: "",
  date: "",
  time: "",
  notes: "",
  paymentRef: "",
  paymentNote: "",
  tourType: "",
  tourLanguage: "",
  occasionType: "",
  occasionOther: "",
  endTime: "",
  durationHours: "",
  decorProvider: "",
  foodProvider: null,
  foodNotes: "",
  hasBand: null,
  bandDetails: "",
  hasPhotography: null,
  needsSpecialSetup: null,
  hospitalityType: "",
  dietaryNotes: "",
};

export default function BookingApp() {
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState<BookingStep>("landing");
  const [selected, setSelected] = useState<BookingType>("occasion");
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [notice, setNotice] = useState("");

  const content = bookingContent[lang];
  const fontClass = lang === "en" ? latinFont.className : arabicFont.className;

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function showSoon() {
    setNotice(content.soonMessage);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function openBooking(type: BookingType) {
    setSelected(type);
    setStep("form");
  }

  return (
    <main className={`${fontClass} min-h-screen bg-[#070504]`}>
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#120d0a] shadow-2xl">
        {step === "landing" ? (
          <LandingScreen
            lang={lang}
            content={content}
            selected={selected}
            notice={notice}
            onLangChange={setLang}
            onSelect={openBooking}
            onSoon={showSoon}
          />
        ) : (
          <BookingFormScreen
            lang={lang}
            type={selected}
            form={form}
            content={content}
            update={update}
            onLangChange={setLang}
            onBack={() => setStep("landing")}
          />
        )}
      </div>
    </main>
  );
}
