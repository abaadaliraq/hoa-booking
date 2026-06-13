"use client";

import { useMemo, useState } from "react";
import type { BookingContent, Lang } from "@/types/booking";

type Props = {
  value: string;
  lang: Lang;
  content: BookingContent;
  onChange: (value: string) => void;
};

function toValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function SoftCalendar({ value, lang, content, onChange }: Props) {
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  const [month, setMonth] = useState(
    new Date(base.getFullYear(), base.getMonth(), 1)
  );

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: first }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ];
  }, [month]);

  const locale = lang === "ar" ? "ar-IQ" : lang === "ku" ? "ku-IQ" : "en-US";
  const title = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(month);

  return (
    <div className="rounded-2xl border border-[#d8a45f]/18 bg-white/[0.045] p-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={content.calendar.previous}
          onClick={() =>
            setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
          }
          className="h-8 w-8 rounded-full bg-white/[0.06] text-[#f1c982]"
        >
          {"<"}
        </button>
        <strong className="text-sm font-medium text-[#fff8ea]">{title}</strong>
        <button
          type="button"
          aria-label={content.calendar.next}
          onClick={() =>
            setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
          }
          className="h-8 w-8 rounded-full bg-white/[0.06] text-[#f1c982]"
        >
          {">"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-[#b69a75]">
        {content.calendar.weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="aspect-square" />;
          const dateValue = toValue(new Date(month.getFullYear(), month.getMonth(), day));
          const active = value === dateValue;

          return (
            <button
              key={dateValue}
              type="button"
              onClick={() => onChange(dateValue)}
              className={`aspect-square rounded-full text-xs transition ${
                active
                  ? "bg-[#d8a45f] text-[#120d0a]"
                  : "bg-white/[0.04] text-[#ead3b1]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
