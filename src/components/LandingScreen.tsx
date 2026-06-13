"use client";

import { langLabels, langs } from "@/data/bookingContent";
import BookingTypeSlider from "@/components/BookingTypeSlider";
import type { BookingContent, BookingType, Lang } from "@/types/booking";

type Props = {
  lang: Lang;
  content: BookingContent;
  selected: BookingType;
  notice: string;
  onLangChange: (lang: Lang) => void;
  onSelect: (type: BookingType) => void;
  onSoon: () => void;
};

export default function LandingScreen({
  lang,
  content,
  selected,
  notice,
  onLangChange,
  onSelect,
  onSoon,
}: Props) {
  const current = content.types[selected];
  const isRtl = lang !== "en";

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-hidden bg-[#120d0a] text-[#fff8ea]"
    >
      <div
        key={current.image}
        className="absolute inset-0 bg-cover bg-center animate-[heroFade_420ms_ease-out]"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(18,13,10,0.14),rgba(18,13,10,0.5) 45%,#120d0a 88%), url('${current.image}')`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(216,164,95,0.18),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:url('/images/hoa-pattern.jpg')] [background-position:center] [background-size:cover]" />

      {notice && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full bg-[#120d0a]/90 px-5 py-3 text-sm text-[#f1c982] shadow-xl">
          {notice}
        </div>
      )}

      <header className="relative z-10 flex items-center justify-between px-5 pt-6" dir="ltr">
        <div className="flex items-center gap-4">
          <span className="block h-0.5 w-4 bg-[#fff8ea]" />
          <span className="block h-0.5 w-4 bg-[#fff8ea]/70" />
        </div>

        <div className="flex rounded-full bg-[#120d0a]/35 p-1 text-[11px] backdrop-blur-md">
          {langs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onLangChange(item)}
              className={`rounded-full px-2.5 py-1.5 transition ${
                lang === item ? "bg-[#d8a45f] text-[#120d0a]" : "text-[#f2d8b2]"
              }`}
            >
              {langLabels[item]}
            </button>
          ))}
        </div>

        <div className="text-[12px] tracking-[0.28em] text-[#f1c982]">HOA</div>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-66px)] flex-col justify-end px-5 pb-16">
        <div className="animate-[stepIn_360ms_ease-out]">
          <p className="text-xs tracking-[0.24em] text-[#f1c982]">
            {content.brand}
          </p>
          <h1 className="mt-3 max-w-[320px] text-[46px] font-semibold leading-[0.94] text-white">
            {current.title}
          </h1>
          <p className="mt-4 max-w-[300px] text-sm leading-7 text-[#ead3b1]">
            {current.subtitle}
          </p>

        </div>

        <div className="mt-7">
          <h2 className="mb-3 text-sm font-medium text-[#fff8ea]">
            {content.bookingTypesTitle}
          </h2>
          <BookingTypeSlider
            content={content}
            selected={selected}
            onSelect={onSelect}
            onSoon={onSoon}
          />
        </div>
      </div>
    </section>
  );
}
