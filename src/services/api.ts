/**
 * Typed wrappers over the /api routes.
 *
 * The types below describe what the server actually sends: camelCase fields
 * matching the Prisma models, money already converted to numbers, and
 * date-only columns as "YYYY-MM-DD". They are not aspirational - if one of
 * them drifts from a route, `getList` throws an ApiShapeError rather than
 * failing silently.
 *
 * This module previously spoke to a Django backend over axios with a bearer
 * token from localStorage. Auth is cookie-based now, so none of that remains.
 */

import { del, get, getList, getPage, patch, post } from "@/lib/api-client";

export { ApiError, ApiShapeError, errorMessage } from "@/lib/api-client";
export type { Paginated } from "@/lib/api-client";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type LaboratoryTestStatus = AppointmentStatus;
export type PharmacyOrderStatus = "pending" | "processing" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed";
// PRESCRIPTION FEATURE — DISABLED (not deleted).
// export type PrescriptionStatus = "pending" | "verified" | "rejected";
export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK";

/** Patient summary embedded in admin-facing records. */
export interface PatientSummary {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  address: string;
  role: "patient" | "admin";
}

export type BookingMode = "scheduled" | "on_call";

export interface DoctorAvailability {
  /** 0 = Sunday ... 6 = Saturday. */
  dayOfWeek: number;
  /** "HH:MM" */
  start: string;
  /** "HH:MM" */
  end: string;
}

export interface BookableDoctor {
  id: string;
  slug: string;
  legacyId: number | null;
  name: string;
  specialty: string;
  education: string;
  experience: string;
  image: string | null;
  scheduleNote: string;
  opdCharge: number;
  nmcNumber: string;
  bookingMode: BookingMode;
  slotDurationMinutes: number;
  availability: DoctorAvailability[];
}

export interface Slot {
  /** "HH:MM" */
  time: string;
  available: boolean;
  reason?: "booked" | "too-soon";
}

export interface DoctorSlots {
  doctor: {
    id: string;
    slug: string;
    name: string;
    specialty: string;
    opdCharge: number;
    scheduleNote: string;
  };
  /** "YYYY-MM-DD" */
  date: string;
  bookingMode: BookingMode;
  slots: Slot[];
  message?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string | null;
  doctorName: string;
  doctorSpecialization: string;
  /** The consultation fee agreed at booking. Null on pre-migration rows. */
  opdCharge: number | null;
  /** "YYYY-MM-DD" */
  appointmentDate: string;
  /** "HH:MM", or "" for an on-call request the clinic has not timed yet. */
  appointmentTime: string;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientSummary;
}

export interface LaboratoryTest {
  id: string;
  patientId: string;
  testName: string;
  testDescription: string;
  /** "YYYY-MM-DD" */
  testDate: string;
  testTime: string;
  status: LaboratoryTestStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientSummary;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  stock: StockStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyOrder {
  id: string;
  patientId: string;
  medicineId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  deliveryAddress?: string | null;
  paymentMethod?: string | null;
  status: PharmacyOrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  patient?: PatientSummary;
  medicine?: Medicine;
}

// PRESCRIPTION FEATURE — DISABLED (not deleted). See
// src/app/api/prescriptions/route.ts for the rationale and the security fixes
// required before re-enabling.
//
// export interface Prescription {
//   id: string;
//   patientId: string;
//   prescriptionImageUrl: string;
//   status: PrescriptionStatus;
//   notes?: string | null;
//   createdAt: string;
//   updatedAt: string;
//   patient?: PatientSummary;
// }

/* -------------------------------------------------------------------------- */
/*                                 Endpoints                                  */
/* -------------------------------------------------------------------------- */

function query(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const doctors = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<BookableDoctor>(`/doctors${query(params)}`),
  /** Real availability for one doctor on one date. */
  slots: (doctorId: string, date: string) =>
    get<DoctorSlots>(`/doctors/${encodeURIComponent(doctorId)}/slots${query({ date })}`),
};

export const appointments = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<Appointment>(`/appointments${query(params)}`),
  page: (params: { page?: number; limit?: number } = {}) =>
    getPage<Appointment>(`/appointments${query(params)}`),
  /**
   * `doctorId` accepts the cuid, the slug, or the numeric id used in
   * /doctors/[id] URLs. The server reads the name, specialty and fee from the
   * doctor record — sending them from here would let the client disagree with
   * the doctor it is booking.
   *
   * `appointmentTime` is omitted for on-call doctors: the clinic sets it when
   * it confirms.
   */
  create: (data: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime?: string;
    reason?: string;
    notes?: string;
  }) => post<Appointment>("/appointments", data),
  update: (id: string, data: Partial<Pick<Appointment, "status" | "notes" | "reason">>) =>
    patch<Appointment>(`/appointments/${id}`, data),
  cancel: (id: string) =>
    patch<Appointment>(`/appointments/${id}`, { status: "cancelled" }),
};

export const laboratoryTests = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<LaboratoryTest>(`/laboratory-tests${query(params)}`),
  page: (params: { page?: number; limit?: number } = {}) =>
    getPage<LaboratoryTest>(`/laboratory-tests${query(params)}`),
  create: (data: {
    testName: string;
    testDescription: string;
    testDate: string;
    testTime: string;
    notes?: string;
  }) => post<LaboratoryTest>("/laboratory-tests", data),
  update: (id: string, data: Partial<Pick<LaboratoryTest, "status" | "notes">>) =>
    patch<LaboratoryTest>(`/laboratory-tests/${id}`, data),
  cancel: (id: string) =>
    patch<LaboratoryTest>(`/laboratory-tests/${id}`, { status: "cancelled" }),
};

export const pharmacyOrders = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<PharmacyOrder>(`/pharmacy-orders${query(params)}`),
  getById: (id: string) => get<PharmacyOrder>(`/pharmacy-orders/${id}`),
  /**
   * The server re-reads the price from the database, so only the medicine and
   * quantity are sent. Passing a price here would be ignored.
   */
  create: (data: {
    medicineId: string;
    quantity: number;
    deliveryAddress?: string;
    paymentMethod?: string;
  }) => post<PharmacyOrder>("/pharmacy-orders", data),
  update: (id: string, data: Partial<Pick<PharmacyOrder, "status" | "paymentStatus">>) =>
    patch<PharmacyOrder>(`/pharmacy-orders/${id}`, data),
  cancel: (id: string) =>
    patch<PharmacyOrder>(`/pharmacy-orders/${id}`, { status: "cancelled" }),
};

export const medicines = {
  list: (params: {
    category?: string;
    search?: string;
    in_stock?: boolean;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  } = {}) => getList<Medicine>(`/medicines${query(params)}`),
  getById: (id: string) => get<Medicine>(`/medicines/${id}`),
  getByCategory: (category: string, limit = 100) =>
    getList<Medicine>(`/medicines${query({ category, limit })}`),
  search: (search: string, limit = 50) =>
    getList<Medicine>(`/medicines${query({ search, limit })}`),
  getCategories: () => getList<string>("/medicines/categories"),
  /** Returns a few medicines per category, keyed by a normalised category name. */
  getFeatured: (limit = 3) =>
    get<Record<string, Medicine[]>>(`/medicines/featured${query({ limit })}`),
  create: (data: Omit<Medicine, "id" | "createdAt" | "updatedAt">) =>
    post<Medicine>("/medicines", data),
  update: (id: string, data: Partial<Medicine>) =>
    patch<Medicine>(`/medicines/${id}`, data),
  remove: (id: string) => del<{ message?: string }>(`/medicines/${id}`),
};

// PRESCRIPTION FEATURE — DISABLED (not deleted). The endpoints now 404; see
// src/app/api/prescriptions/route.ts before re-enabling.
//
// export const prescriptions = {
//   list: (params: { page?: number; limit?: number } = {}) =>
//     getList<Prescription>(`/prescriptions${query(params)}`),
//   getById: (id: string) => get<Prescription>(`/prescriptions/${id}`),
//   create: (data: { prescriptionImageUrl: string; notes?: string }) =>
//     post<Prescription>("/prescriptions", data),
//   update: (id: string, data: Partial<Pick<Prescription, "status" | "notes">>) =>
//     patch<Prescription>(`/prescriptions/${id}`, data),
//   remove: (id: string) => del<{ message?: string }>(`/prescriptions/${id}`),
// };
