export type Lang = "ar" | "en" | "ku";

export type BookingType =
  | "visit"
  | "tour"
  | "photoSession"
  | "occasion"
  | "hospitality"
  | "exhibition"
  | "auction";

export type BookingExperience = BookingType;

export type BookingStep = "landing" | "form";

export type BookingForm = {
  fullName: string;
  phone: string;
  email: string;
  birthdate: string;
  guests: number;
  childrenCount: number;
  hasChildren: boolean | null;
  isForeign: boolean | null;
  country: string;
  province: string;
  date: string;
  time: string;
  notes: string;
  paymentRef: string;
  paymentNote: string;
  tourType: string;
  tourLanguage: string;
  occasionType: string;
  occasionOther: string;
  endTime: string;
  durationHours: string;
  decorProvider: string;
  foodProvider: boolean | null;
  foodNotes: string;
  hasBand: boolean | null;
  bandDetails: string;
  hasPhotography: boolean | null;
  needsSpecialSetup: boolean | null;
  hospitalityType: string;
  dietaryNotes: string;
};

export type BookingTypeContent = {
  title: string;
  shortTitle: string;
  subtitle: string;
  image: string;
  comingSoon?: boolean;
};

export type BookingContent = {
  brand: string;
  tagline: string;
  bookingTypesTitle: string;
  continueBooking: string;
  sendRequest: string;
  back: string;
  menu: string;
  soon: string;
  soonMessage: string;
  pricePerPerson: string;
  total: string;
  masterCardTransfer: string;
  masterCardNumber: string;
  occasionPricing: string;
  hospitalityPricing: string;
  labels: Record<string, string>;
  options: Record<string, string>;
  calendar: {
    previous: string;
    next: string;
    weekdays: string[];
  };
  types: Record<BookingType, BookingTypeContent>;
};
