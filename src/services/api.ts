import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  reason?: string;
  notes?: string;
  patientId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  address: string;
  role: 'patient' | 'admin';
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: 'In Stock' | 'Out of Stock';
  created_at?: string;
  updated_at?: string;
}

export interface LaboratoryTest {
  id: number;
  testName: string;
  testDescription: string;
  testDate: string;
  testTime: string;
  status: string;
  notes?: string;
  patientId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PharmacyOrder {
  id: number;
  patient_id: string;
  patient?: string;
  medicine_name: string;
  quantity: number;
  price_per_unit: number;
  medicine_image?: string;
  medicine_image_url?: string;
  total_amount: number;
  order_date: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  delivery_address?: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
}
export interface Prescription {
  id: number;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  prescription_image: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}


export interface MedicalRecord {
  id: number;
  patient: number;
  patient_name: string;
  title: string;
  description: string | null;
  file: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (phone: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { phone, password });
    const { access, refresh, user } = response.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response;
  },
  register: async (data: {
    phone: string;
    password: string;
    name: string;
    email: string;
    address: string;
  }) => {
    const cleanedPhone = data.phone.replace(/\D/g, '');

    if (cleanedPhone.length !== 10 || !cleanedPhone.startsWith('9')) {
      throw new Error('Phone number must be 10 digits starting with 9');
    }
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const payload = {
      phone: cleanedPhone,
      name: data.name,
      email: data.email,
      password: data.password,
      address: data.address,
    };

    return api.post('/auth/register', payload);
  },
  getProfile: () => {
    return api.get<User>('/users/me');
  },
};

export const appointments = {
  getAll: () => {
    return api.get<Appointment[]>('/appointments');
  },
  create: (data: {
    doctorName: string;
    doctorSpecialization: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
    notes?: string;
  }) => {
    return api.post<Appointment>('/appointments', data);
  },
  update: (id: number, data: Partial<Appointment>) => {
    return api.patch<Appointment>(`/appointments/${id}`, data);
  },
  cancel: (id: number) => {
    return api.patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' });
  },
};

export const laboratoryTests = {
  getAll: () => {
    return api.get<LaboratoryTest[]>('/laboratory-tests');
  },
  create: (data: {
    testName: string;
    testDescription: string;
    testDate: string;
    testTime: string;
    notes?: string;
  }) => {
    return api.post<LaboratoryTest>('/laboratory-tests', data);
  },
  update: (id: number, data: Partial<LaboratoryTest>) => {
    return api.patch<LaboratoryTest>(`/laboratory-tests/${id}`, data);
  },
  cancel: (id: number) => {
    return api.patch<LaboratoryTest>(`/laboratory-tests/${id}`, { status: 'cancelled' });
  }
};

export const pharmacyOrders = {
  getAll: () => {
    return api.get<PharmacyOrder[]>('/pharmacy-orders');
  },
  create: (data: {
    patient_id: string;
    medicine_name: string;
    quantity: number;
    price_per_unit: number;
    medicine_image?: string;
    total_amount: number;
    delivery_address?: string;
    payment_method?: string;
  }) => {
    return api.post<PharmacyOrder>('/pharmacy-orders', data);
  },
  getById: (id: number) => {
    return api.get<PharmacyOrder>(`/pharmacy-orders/${id}`);
  },
  update: (id: number, data: Partial<PharmacyOrder>) => {
    return api.patch<PharmacyOrder>(`/pharmacy-orders/${id}`, data);
  },
  cancel: (id: number) => {
    return api.patch<PharmacyOrder>(`/pharmacy-orders/${id}`, { status: 'cancelled' });
  }
};

export const medicalRecords = {
  getAll: () => {
    return api.get<MedicalRecord[]>('/medical-records');
  },
  upload: (formData: FormData) => {
    return api.post<MedicalRecord>('/medical-records', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getById: (id: number) => {
    return api.get<MedicalRecord>(`/medical-records/${id}`);
  },
  delete: (id: number) => {
    return api.delete(`/medical-records/${id}`);
  },
};

export const medicines = {
  getAll: () => {
    return api.get<Medicine[]>('/medicines');
  },
  getById: (id: string) => {
    return api.get<Medicine>(`/medicines/${id}`);
  },
  getByCategory: (category: string) => {
    const encodedCategory = encodeURIComponent(category);
    return api.get<Medicine[]>(`/medicines?category=${encodedCategory}`);
  },
  getCategories: () => {
    return api.get<string[]>('/medicines/categories');
  },
  getFeatured: (limit: number = 3) => {
    return api.get<Record<string, Medicine[]>>(`/medicines/featured?limit=${limit}`);
  },
  search: (query: string) => {
    return api.get<Medicine[]>(`/medicines?search=${query}`);
  },
  filter: (params: {
    category?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.in_stock !== undefined) queryParams.append('in_stock', params.in_stock.toString());

    return api.get<Medicine[]>(`/medicines?${queryParams.toString()}`);
  },
};


export const prescriptions = {
  getAll: () => {
    return api.get<Prescription[]>('/prescriptions');
  },
  upload: (formData: FormData) => {
    return api.post<Prescription>('/prescriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getById: (id: number) => {
    return api.get<Prescription>(`/prescriptions/${id}`);
  },
  delete: (id: number) => {
    return api.delete(`/prescriptions/${id}`);
  },
};
