import type { Slot } from "./domain";
export const exhibitionHours = [17, 18, 19, 20] as const;
export function timeWindowLabel(start: string, end: string) {
  const hour = (value: string) => Number(value.slice(0, 2)) % 12 || 12;
  return `${hour(start)} – ${hour(end)} مساءً`;
}
/** The schedule is visible even while loading; only real server inventory can be selected. */
export function visitTimeChoices(slots: Slot[], date: string, count: number) {
  return exhibitionHours.map(hour => {
    const start = `${hour}:00`, end = `${hour + 1}:00`;
    const slot = slots.find(item => item && item.visit_date === date && typeof item.id === "string" && item.id.length > 0 && typeof item.start_time === "string" && typeof item.end_time === "string" && item.start_time.slice(0, 5) === start && item.end_time.slice(0, 5) === end && Number.isInteger(item.remaining) && item.remaining > 0);
    return { key: start, label: timeWindowLabel(start, end), slot, disabled: !slot || !Number.isInteger(count) || count < 1 || count > 60 || count > slot.remaining };
  });
}
