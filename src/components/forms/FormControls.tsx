"use client";

import type { BookingContent } from "@/types/booking";

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] tracking-[0.04em] text-[#d9c1a3]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-none border-0 border-b border-[#d8a45f]/25 bg-transparent px-0 text-[14px] text-[#fff8ea] outline-none transition placeholder:text-[#8f7961] focus:border-[#d8a45f]"
      />
    </label>
  );
}

export function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] tracking-[0.04em] text-[#d9c1a3]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="w-full resize-none rounded-2xl border border-[#d8a45f]/20 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-[#fff8ea] outline-none transition focus:border-[#d8a45f]/70"
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] tracking-[0.04em] text-[#d9c1a3]">
        {label}
      </span>
      <div className="flex h-10 items-center justify-between border-b border-[#d8a45f]/25">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-8 w-8 rounded-full bg-white/[0.06] text-[#f1c982]"
        >
          -
        </button>
        <strong className="text-xl font-medium text-[#fff8ea]">{value}</strong>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded-full bg-[#d8a45f] text-[#120d0a]"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function YesNo({
  label,
  value,
  content,
  onChange,
}: {
  label: string;
  value: boolean | null;
  content: BookingContent;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] tracking-[0.04em] text-[#d9c1a3]">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((item) => (
          <button
            key={String(item)}
            type="button"
            onClick={() => onChange(item)}
            className={`rounded-full border px-3 py-2 text-xs transition ${
              value === item
                ? "border-[#d8a45f] bg-[#d8a45f] text-[#120d0a]"
                : "border-[#d8a45f]/20 bg-white/[0.04] text-[#d9c1a3]"
            }`}
          >
            {item ? content.options.yes : content.options.no}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Pills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] tracking-[0.04em] text-[#d9c1a3]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3.5 py-2 text-xs transition ${
              value === option
                ? "border-[#d8a45f] bg-[#d8a45f] text-[#120d0a]"
                : "border-[#d8a45f]/20 bg-white/[0.04] text-[#d9c1a3]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
