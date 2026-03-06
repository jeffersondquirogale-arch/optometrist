import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? 'Ha ocurrido un error. Intente nuevamente.';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  },
);

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsApi = {
  getAll: () => api.get<{ data: Patient[] }>('/patients').then((r) => r.data.data),
  getById: (id: string) => api.get<{ data: Patient }>(`/patients/${id}`).then((r) => r.data.data),
  create: (data: CreatePatientInput) =>
    api.post<{ data: Patient }>('/patients', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreatePatientInput>) =>
    api.patch<{ data: Patient }>(`/patients/${id}`, data).then((r) => r.data.data),
};

// ─── Consultations ────────────────────────────────────────────────────────────
export const consultationsApi = {
  getAll: () =>
    api.get<{ data: Consultation[] }>('/consultations').then((r) => r.data.data),
  getById: (id: string) =>
    api.get<{ data: Consultation }>(`/consultations/${id}`).then((r) => r.data.data),
  create: (data: CreateConsultationInput) =>
    api.post<{ data: Consultation }>('/consultations', data).then((r) => r.data.data),
};

// ─── Print ────────────────────────────────────────────────────────────────────
export const printApi = {
  getConsultation: (consultationId: string) =>
    api
      .get<{ data: Consultation }>(`/print/consultations/${consultationId}`)
      .then((r) => r.data.data),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentId?: string;
  birthDate?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  documentId?: string;
  birthDate?: string;
  gender?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  phone?: string;
  email?: string;
  address?: string;
  occupation?: string;
  notes?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  user: { name: string };
}

export interface Lensometry {
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAdd?: number;
  oiSphere?: number;
  oiCylinder?: number;
  oiAxis?: number;
  oiAdd?: number;
  notes?: string;
}

export interface VisualAcuity {
  odScVision?: string;
  oiScVision?: string;
  odCcVision?: string;
  oiCcVision?: string;
  nearVision?: string;
  colorVision?: string;
  iop?: string;
  notes?: string;
}

export interface FinalFormula {
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAdd?: number;
  odPrism?: string;
  oiSphere?: number;
  oiCylinder?: number;
  oiAxis?: number;
  oiAdd?: number;
  oiPrism?: string;
  lensType?: string;
  lensMaterial?: string;
  lensCoating?: string;
  dpOd?: number;
  dpOi?: number;
  notes?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  paymentStatus: 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ANULADO';
  paymentAmount?: number;
  patient: Patient;
  doctor: DoctorProfile;
  lensometry?: Lensometry;
  visualAcuity?: VisualAcuity;
  finalFormula?: FinalFormula;
}

export interface CreateConsultationInput {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationDate?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  paymentStatus?: 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ANULADO';
  paymentAmount?: number;
}
