export type BookingType =
  | "visit"
  | "restaurant"
  | "photography"
  | "occasion"
  | "workshop"
  | "auction"
  | "exhibition";

export type BookingFormData = {
  booking_id: string;
  created_at: string;

  event_type: string;
  people_count: string;
  booking_date: string;
  start_time: string;
  start_time_ar: string;
  end_time: string;
  end_time_ar: string;
  duration_hours: string;

  full_name: string;
  birthdate: string;
  phone: string;
  customer_email: string;

  has_kids: string;
  youngest_kid_age: string;

  photography_type: string;
  photography_other: string;
  photography_hours: string;
  photography_price_per_hour: string;

  payment_required: string;
  payment_method: string;
  payment_per_person: string;
  payment_total: string;
  payment_card_number: string;
  payment_ref: string;
  payment_notice: string;

  occasion_type: string;
  occasion_other: string;
  decor_provider: string;
  food_from_hoa: string;
  has_band: string;
  band_details: string;

  group_type: string;
  is_foreign: string;
  country: string;
  province: string;
  interests: string;

  restaurant_area: string;
  restaurant_booking_type: string;
  food_notes: string;

  workshop_topic: string;
  organizer_name: string;
  needs_projector: string;
  needs_microphone: string;

  notes: string;
};