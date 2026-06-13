"use client";

import SoftCalendar from "@/components/SoftCalendar";
import { Field, NumberField, Pills, Textarea, YesNo } from "@/components/forms/FormControls";
import type { BookingContent, BookingForm, Lang } from "@/types/booking";

type Props = {
  form: BookingForm;
  lang: Lang;
  content: BookingContent;
  update: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
};

export default function HospitalityForm({ form, lang, content, update }: Props) {
  return (
    <div className="space-y-4">
      <Field label={content.labels.fullName} value={form.fullName} onChange={(value) => update("fullName", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.phone} value={form.phone} type="tel" onChange={(value) => update("phone", value)} />
        <NumberField label={content.labels.guests} value={form.guests} min={1} onChange={(value) => update("guests", value)} />
      </div>
      <SoftCalendar value={form.date} lang={lang} content={content} onChange={(value) => update("date", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.time} value={form.time} type="time" onChange={(value) => update("time", value)} />
      </div>
      <Pills
        label={content.labels.hospitalityType}
        value={form.hospitalityType}
        options={[content.options.coffee, content.options.lightMeal, content.options.dinner, content.options.smallOccasion, content.options.other]}
        onChange={(value) => update("hospitalityType", value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <YesNo label={content.labels.hasChildren} value={form.hasChildren} content={content} onChange={(value) => {
          update("hasChildren", value);
          update("childrenCount", value ? Math.max(1, form.childrenCount) : 0);
        }} />
      </div>
      {form.hasChildren && <NumberField label={content.labels.childrenCount} value={form.childrenCount} min={1} onChange={(value) => update("childrenCount", value)} />}
      <Textarea label={content.labels.dietaryNotes} value={form.dietaryNotes} onChange={(value) => update("dietaryNotes", value)} />
      <Textarea label={content.labels.notes} value={form.notes} onChange={(value) => update("notes", value)} />
    </div>
  );
}
