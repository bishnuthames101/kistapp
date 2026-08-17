/**
 * How a patient can book this doctor.
 *
 * The old booking UI generated 10:00-16:00 slots for every doctor on every
 * date from a hardcoded loop, while the doctor's real schedule sat one card
 * above as decorative text. Seven of the nine doctors here are on call — they
 * have no fixed clinic hours at all — so those slots were pure fiction.
 *
 * - `scheduled`: real weekly hours. The patient picks an exact time and the
 *   database enforces that nobody else holds it.
 * - `on_call`: the patient submits a request with a preferred date; the clinic
 *   confirms an actual time by phone. No slot is offered, because none exists.
 */
export type BookingMode = "scheduled" | "on_call";

/** A recurring weekly working window. */
export interface Availability {
  /** 0 = Sunday ... 6 = Saturday, matching JavaScript's `Date.getDay()`. */
  dayOfWeek: number;
  /** 24-hour "HH:MM". */
  start: string;
  /** 24-hour "HH:MM", exclusive. */
  end: string;
}

export interface Doctor {
  id: number;
  /** Stable, URL-safe key. Used to match a row in the `doctors` table. */
  slug: string;
  name: string;
  specialty: string;
  education: string;
  experience: string;
  image: string;
  /** The human sentence shown on the doctor card. */
  schedule: string;
  opdCharge: number;
  nmcNumber: string;
  bookingMode: BookingMode;
  /** Empty for `on_call` doctors. */
  availability: Availability[];
  /** Appointment length for `scheduled` doctors. */
  slotDurationMinutes: number;
}

export const doctors: Doctor[] = [
  {
    id: 1,
    slug: "prabhakar-shah",
    name: "Dr. Prabhakar Shah",
    specialty: "Consultant General, Laparoscopic & Laser Surgeon",
    education: "MBBS, MUMS MS (Pakistan)",
    experience: "10+ years",
    image: "/doctors/Prabhakar Shah.jpg",
    schedule: "Time schedule changes every week",
    opdCharge: 800,
    nmcNumber: "8698",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 2,
    slug: "arbind-sah",
    name: "Dr. Arbind Sah",
    specialty: "Senior Consultant Physician",
    education: "MBBS, MD (Internal Medicine)",
    experience: "7+ years",
    image: "/doctors/Arbind Sah.jpg",
    schedule: "Sun-Wed: 10AM - 5PM",
    opdCharge: 650,
    nmcNumber: "9037",
    bookingMode: "scheduled",
    availability: [
      { dayOfWeek: 0, start: "10:00", end: "17:00" },
      { dayOfWeek: 1, start: "10:00", end: "17:00" },
      { dayOfWeek: 2, start: "10:00", end: "17:00" },
      { dayOfWeek: 3, start: "10:00", end: "17:00" },
    ],
    slotDurationMinutes: 30
  },
  {
    id: 3,
    slug: "ranjit-sah",
    name: "Dr. Ranjit Sah",
    specialty: "Consultant Orthopedic Surgeon",
    education: "MBBS (KU), MS Orthopedic (KEMU, Pakistan)",
    experience: "7+ years",
    image: "/doctors/Ranjit Sah.jpg",
    schedule: "Mon-Fri: 11AM - 2PM",
    opdCharge: 650,
    nmcNumber: "10861",
    bookingMode: "scheduled",
    availability: [
      { dayOfWeek: 1, start: "11:00", end: "14:00" },
      { dayOfWeek: 2, start: "11:00", end: "14:00" },
      { dayOfWeek: 3, start: "11:00", end: "14:00" },
      { dayOfWeek: 4, start: "11:00", end: "14:00" },
      { dayOfWeek: 5, start: "11:00", end: "14:00" },
    ],
    slotDurationMinutes: 20
  },
  {
    id: 4,
    slug: "bibek-joshi",
    name: "Dr. Bibek Joshi",
    specialty: "Radiologist, USG Specialist",
    education: "MBBS, MD (Radiology)",
    experience: "20+ years",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    schedule: "On call appointment (except Saturday)",
    opdCharge: 650,
    nmcNumber: "623",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 5,
    slug: "ram-krishna-giri",
    name: "Dr. Ram Krishna Giri",
    specialty: "Consultant Immunologist and Rheumatologist",
    education: "MBBS, MD, FCIR",
    experience: "10+ years",
    image: "/doctors/Ram Krishna Giri.jpg",
    schedule: "Every third Saturday of each month",
    opdCharge: 800,
    nmcNumber: "6728",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 6,
    slug: "laxman-kuwar",
    name: "Dr. Laxman Kuwar",
    specialty: "Radiologist, X-ray Reporting Specialist",
    education: "MBBS, MD (Radiology)",
    experience: "20+ years",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    schedule: "On call appointment",
    opdCharge: 650,
    nmcNumber: "2568",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 7,
    slug: "sukhesh-purush-dhakal",
    name: "Dr. Sukhesh Purush Dhakal",
    specialty: "Senior Consultant Physician & Endocrinologist (Sugar and Thyroid Specialist)",
    education: "MBBS, MD (HONS) Internal Medicine, Member ACP USA",
    experience: "10+ years",
    image: "/doctors/Sukhesh Purush Dhakal.jpg",
    schedule: "On call appointment",
    opdCharge: 800,
    nmcNumber: "8216",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 8,
    slug: "jitendra-singh",
    name: "Dr. Jitendra Singh",
    specialty: "Obstetrician & Gynecologist, Laparoscopic Surgeon, Infertility Specialist",
    education: "MBBS (TU), MD (NAMS, BIR Hospital)",
    experience: "5+ years",
    image: "/doctors/Jitendra Singh.jpg",
    schedule: "On call appointment",
    opdCharge: 825,
    nmcNumber: "16819",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  },
  {
    id: 9,
    slug: "jitendra-prasad-yadav",
    name: "Dr. Jitendra Prasad Yadav",
    specialty: "Senior Consultant Physician & Neurologist",
    education: "MBBS, MD, FICN",
    experience: "10+ years",
    image: "/doctors/Jitendra Prasad Yadav.jpg",
    schedule: "On call appointment",
    opdCharge: 800,
    nmcNumber: "8029",
    bookingMode: "on_call",
    availability: [],
    slotDurationMinutes: 30
  }
];

export const getDoctorById = (id: number) =>
  doctors.find((doctor) => doctor.id === id);

export const getDoctorBySlug = (slug: string) =>
  doctors.find((doctor) => doctor.slug === slug);
