"use client";

import SoftCalendar from "@/components/SoftCalendar";
import { Field, NumberField, Textarea, YesNo } from "@/components/forms/FormControls";
import type { BookingContent, BookingForm, Lang } from "@/types/booking";

type Props = {
  form: BookingForm;
  lang: Lang;
  content: BookingContent;
  update: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
};

export default function VisitForm({ form, lang, content, update }: Props) {
  return (
    <div className="space-y-4">
      <Field label={content.labels.fullName} value={form.fullName} onChange={(value) => update("fullName", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.phone} value={form.phone} type="tel" onChange={(value) => update("phone", value)} />
        <Field label={content.labels.birthdate} value={form.birthdate} type="date" onChange={(value) => update("birthdate", value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberField label={content.labels.guests} value={form.guests} min={1} onChange={(value) => update("guests", value)} />
        <YesNo label={content.labels.hasChildren} value={form.hasChildren} content={content} onChange={(value) => {
          update("hasChildren", value);
          update("childrenCount", value ? Math.max(1, form.childrenCount) : 0);
        }} />
      </div>
      {form.hasChildren && (
        <NumberField label={content.labels.childrenCount} value={form.childrenCount} min={1} onChange={(value) => update("childrenCount", value)} />
      )}
      <YesNo label={content.labels.isForeign} value={form.isForeign} content={content} onChange={(value) => {
        update("isForeign", value);
        update(value ? "province" : "country", "");
      }} />
      <div className="grid grid-cols-2 gap-4">
        {form.isForeign === true && <Field label={content.labels.country} value={form.country} onChange={(value) => update("country", value)} />}
        {form.isForeign === false && <Field label={content.labels.province} value={form.province} onChange={(value) => update("province", value)} />}
        <Field label={content.labels.time} value={form.time} type="time" onChange={(value) => update("time", value)} />
      </div>
      <SoftCalendar value={form.date} lang={lang} content={content} onChange={(value) => update("date", value)} />
      <Textarea label={content.labels.notes} value={form.notes} onChange={(value) => update("notes", value)} />
    </div>
  );
}
