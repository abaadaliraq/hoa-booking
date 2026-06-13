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

export default function TourForm({ form, lang, content, update }: Props) {
  return (
    <div className="space-y-4">
      <Field label={content.labels.fullName} value={form.fullName} onChange={(value) => update("fullName", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.phone} value={form.phone} type="tel" onChange={(value) => update("phone", value)} />
        <NumberField label={content.labels.guests} value={form.guests} min={1} onChange={(value) => update("guests", value)} />
      </div>
      <Pills
        label={content.labels.tourType}
        value={form.tourType}
        options={[content.options.publicTour, content.options.privateTour, content.options.educationalTour, content.options.foreignGuestsTour, content.options.other]}
        onChange={(value) => update("tourType", value)}
      />
      <Pills
        label={content.labels.tourLanguage}
        value={form.tourLanguage}
        options={[content.options.arabic, content.options.english, content.options.kurdish, content.options.other]}
        onChange={(value) => update("tourLanguage", value)}
      />
      <YesNo label={content.labels.isForeign} value={form.isForeign} content={content} onChange={(value) => {
        update("isForeign", value);
        update(value ? "province" : "country", "");
      }} />
      {form.isForeign === true && <Field label={content.labels.country} value={form.country} onChange={(value) => update("country", value)} />}
      {form.isForeign === false && <Field label={content.labels.province} value={form.province} onChange={(value) => update("province", value)} />}
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.time} value={form.time} type="time" onChange={(value) => update("time", value)} />
      </div>
      <SoftCalendar value={form.date} lang={lang} content={content} onChange={(value) => update("date", value)} />
      <Textarea label={content.labels.notes} value={form.notes} onChange={(value) => update("notes", value)} />
    </div>
  );
}
