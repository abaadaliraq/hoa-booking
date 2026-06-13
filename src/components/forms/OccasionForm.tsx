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

export default function OccasionForm({ form, lang, content, update }: Props) {
  return (
    <div className="space-y-4">
      <Field label={content.labels.fullName} value={form.fullName} onChange={(value) => update("fullName", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.phone} value={form.phone} type="tel" onChange={(value) => update("phone", value)} />
        <NumberField label={content.labels.guests} value={form.guests} min={1} onChange={(value) => update("guests", value)} />
      </div>
      <Field label={content.labels.email} value={form.email} type="email" onChange={(value) => update("email", value)} />
      <SoftCalendar value={form.date} lang={lang} content={content} onChange={(value) => update("date", value)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.time} value={form.time} type="time" onChange={(value) => update("time", value)} />
        <Field label={content.labels.endTime} value={form.endTime} type="time" onChange={(value) => update("endTime", value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label={content.labels.durationHours} value={form.durationHours} type="number" onChange={(value) => update("durationHours", value)} />
      </div>
      <Pills
        label={content.labels.occasionType}
        value={form.occasionType}
        options={[content.options.engagement, content.options.mahr, content.options.birthday, content.options.graduation, content.options.anniversary, content.options.familyParty, content.options.companyParty, content.options.other]}
        onChange={(value) => update("occasionType", value)}
      />
      {form.occasionType === content.options.other && (
        <Field label={content.labels.occasionOther} value={form.occasionOther} onChange={(value) => update("occasionOther", value)} />
      )}
      <Pills
        label={content.labels.decorProvider}
        value={form.decorProvider}
        options={[content.options.hoaDecor, content.options.clientDecor, content.options.thirdPartyDecor, content.options.noDecor]}
        onChange={(value) => update("decorProvider", value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <YesNo label={content.labels.foodProvider} value={form.foodProvider} content={content} onChange={(value) => update("foodProvider", value)} />
        <YesNo label={content.labels.hasBand} value={form.hasBand} content={content} onChange={(value) => update("hasBand", value)} />
      </div>
      {form.foodProvider && <Textarea label={content.labels.foodNotes} value={form.foodNotes} onChange={(value) => update("foodNotes", value)} />}
      {form.hasBand && <Textarea label={content.labels.bandDetails} value={form.bandDetails} onChange={(value) => update("bandDetails", value)} />}
      <div className="grid grid-cols-2 gap-4">
        <YesNo label={content.labels.hasChildren} value={form.hasChildren} content={content} onChange={(value) => {
          update("hasChildren", value);
          update("childrenCount", value ? Math.max(1, form.childrenCount) : 0);
        }} />
        <YesNo label={content.labels.hasPhotography} value={form.hasPhotography} content={content} onChange={(value) => update("hasPhotography", value)} />
      </div>
      {form.hasChildren && <NumberField label={content.labels.childrenCount} value={form.childrenCount} min={1} onChange={(value) => update("childrenCount", value)} />}
      <YesNo label={content.labels.needsSpecialSetup} value={form.needsSpecialSetup} content={content} onChange={(value) => update("needsSpecialSetup", value)} />
      <Textarea label={content.labels.notes} value={form.notes} onChange={(value) => update("notes", value)} />
    </div>
  );
}
