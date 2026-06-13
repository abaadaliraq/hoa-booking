"use client";

import SoftCalendar from "@/components/SoftCalendar";
import {
  Field,
  NumberField,
  Pills,
  Textarea,
  YesNo,
} from "@/components/forms/FormControls";
import type { BookingContent, BookingForm, Lang } from "@/types/booking";

type Props = {
  form: BookingForm;
  lang: Lang;
  content: BookingContent;
  update: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
};

export default function PhotoSessionForm({
  form,
  lang,
  content,
  update,
}: Props) {
  return (
    <div className="space-y-4">
      <Field
        label={content.labels.fullName}
        value={form.fullName}
        onChange={(value) => update("fullName", value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label={content.labels.phone}
          value={form.phone}
          type="tel"
          onChange={(value) => update("phone", value)}
        />
        <NumberField
          label={content.labels.guests}
          value={form.guests}
          min={1}
          onChange={(value) => update("guests", value)}
        />
      </div>
      <SoftCalendar
        value={form.date}
        lang={lang}
        content={content}
        onChange={(value) => update("date", value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label={content.labels.time}
          value={form.time}
          type="time"
          onChange={(value) => update("time", value)}
        />
        <YesNo
          label={content.labels.needsSpecialSetup}
          value={form.needsSpecialSetup}
          content={content}
          onChange={(value) => update("needsSpecialSetup", value)}
        />
      </div>
      <Pills
        label={content.labels.occasionType}
        value={form.occasionType}
        options={[
          content.options.familyParty,
          content.options.engagement,
          content.options.graduation,
          content.options.other,
        ]}
        onChange={(value) => update("occasionType", value)}
      />
      <Textarea
        label={content.labels.notes}
        value={form.notes}
        onChange={(value) => update("notes", value)}
      />
    </div>
  );
}
