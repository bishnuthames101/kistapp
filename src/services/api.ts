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
export type PrescriptionStatus = "pending" | "verified" | "rejected";
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

export interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  doctorSpecialization: string;
  /** "YYYY-MM-DD" */
  appointmentDate: string;
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

export interface Prescription {
  id: string;
  patientId: string;
  prescriptionImageUrl: string;
  status: PrescriptionStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientSummary;
}

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

export const appointments = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<Appointment>(`/appointments${query(params)}`),
  page: (params: { page?: number; limit?: number } = {}) =>
    getPage<Appointment>(`/appointments${query(params)}`),
  create: (data: {
    doctorName: string;
    doctorSpecialization: string;
    appointmentDate: string;
    appointmentTime: string;
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

export const prescriptions = {
  list: (params: { page?: number; limit?: number } = {}) =>
    getList<Prescription>(`/prescriptions${query(params)}`),
  getById: (id: string) => get<Prescription>(`/prescriptions/${id}`),
  create: (data: { prescriptionImageUrl: string; notes?: string }) =>
    post<Prescription>("/prescriptions", data),
  update: (id: string, data: Partial<Pick<Prescription, "status" | "notes">>) =>
    patch<Prescription>(`/prescriptions/${id}`, data),
  remove: (id: string) => del<{ message?: string }>(`/prescriptions/${id}`),
};
