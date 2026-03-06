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
  getAll: (search?: string) => {
    const params = search ? { q: search } : {};
    return api.get<{ data: Patient[] }>('/patients', { params }).then((r) => r.data.data);
  },
  getById: (id: string) => api.get<{ data: Patient }>(`/patients/${id}`).then((r) => r.data.data),
  create: (data: CreatePatientInput) =>
    api.post<{ data: Patient }>('/patients', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreatePatientInput>) =>
    api.patch<{ data: Patient }>(`/patients/${id}`, data).then((r) => r.data.data),
};

// ─── Consultations ────────────────────────────────────────────────────────────
export const consultationsApi = {
  getAll: (patientId?: string) => {
    const params = patientId ? { patientId } : {};
    return api.get<{ data: Consultation[] }>('/consultations', { params }).then((r) => r.data.data);
  },
  getById: (id: string) =>
    api.get<{ data: Consultation }>(`/consultations/${id}`).then((r) => r.data.data),
  create: (data: CreateConsultationInput) =>
    api.post<{ data: Consultation }>('/consultations', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateConsultationInput>) =>
    api.put<{ data: Consultation }>(`/consultations/${id}`, data).then((r) => r.data.data),
  getPatientHistory: (patientId: string) =>
    api
      .get<{ data: Consultation[] }>(`/consultations/patient/${patientId}/history`)
      .then((r) => r.data.data),
  getPatientEvolution: (patientId: string) =>
    api
      .get<{ data: EvolutionPoint[] }>(`/consultations/patient/${patientId}/evolution`)
      .then((r) => r.data.data),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsApi = {
  getAll: (filters?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    return api.get<{ data: Appointment[] }>('/appointments', { params }).then((r) => r.data.data);
  },
  getById: (id: string) =>
    api.get<{ data: Appointment }>(`/appointments/${id}`).then((r) => r.data.data),
  create: (data: CreateAppointmentInput) =>
    api.post<{ data: Appointment }>('/appointments', data).then((r) => r.data.data),
  update: (id: string, data: Partial<CreateAppointmentInput>) =>
    api.patch<{ data: Appointment }>(`/appointments/${id}`, data).then((r) => r.data.data),
};

// ─── Charts ───────────────────────────────────────────────────────────────────
export const chartsApi = {
  getPatientEvolution: (patientId: string) =>
    api
      .get<{ data: EvolutionPoint[] }>(`/charts/patients/${patientId}/evolution`)
      .then((r) => r.data.data),
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

export interface Appointment {
  id: string;
  patientId: string;
  scheduledAt: string;
  reason?: string;
  status: 'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';
  notes?: string;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  scheduledAt: string;
  reason?: string;
  status?: 'PROGRAMADA' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';
  notes?: string;
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

export interface OcularMotility {
  versions?: string;
  ductions?: string;
  coverTest?: string;
  hirschberg?: string;
  npc?: string;
  notes?: string;
}

export interface ExternalExam {
  eyelids?: string;
  conjunctiva?: string;
  cornea?: string;
  iris?: string;
  pupil?: string;
  lens?: string;
  fundus?: string;
  notes?: string;
}

export interface CftaMoscopia {
  campimetry?: string;
  tonometry?: string;
  ascan?: string;
  floaters?: string;
  notes?: string;
}

export interface Keratometry {
  odK1?: number;
  odK1Axis?: number;
  odK2?: number;
  odK2Axis?: number;
  oiK1?: number;
  oiK1Axis?: number;
  oiK2?: number;
  oiK2Axis?: number;
  notes?: string;
}

export interface ColorTest {
  odResult?: string;
  oiResult?: string;
  testType?: string;
  notes?: string;
}

export interface StereopsisTest {
  result?: string;
  testType?: string;
  seconds?: number;
  notes?: string;
}

export interface Refraction {
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  oiSphere?: number;
  oiCylinder?: number;
  oiAxis?: number;
  notes?: string;
}

export interface SubjectiveRefraction {
  odSphere?: number;
  odCylinder?: number;
  odAxis?: number;
  odAdd?: number;
  odVision?: string;
  oiSphere?: number;
  oiCylinder?: number;
  oiAxis?: number;
  oiAdd?: number;
  oiVision?: string;
  notes?: string;
}

export interface ConsultationPathology {
  id: string;
  name: string;
  description?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  control?: string;
  observations?: string;
  paymentStatus: 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ANULADO';
  paymentAmount?: number;
  patient: Patient;
  doctor: DoctorProfile;
  lensometry?: Lensometry;
  visualAcuity?: VisualAcuity;
  finalFormula?: FinalFormula;
  ocularMotility?: OcularMotility;
  externalExam?: ExternalExam;
  cftaMoscopia?: CftaMoscopia;
  keratometry?: Keratometry;
  colorTest?: ColorTest;
  stereopsisTest?: StereopsisTest;
  refraction?: Refraction;
  subjectiveRefraction?: SubjectiveRefraction;
  pathologies?: ConsultationPathology[];
}

export interface CreateConsultationInput {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  consultationDate?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  control?: string;
  observations?: string;
  paymentStatus?: 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ANULADO';
  paymentAmount?: number;
  lensometry?: Lensometry;
  visualAcuity?: VisualAcuity;
  finalFormula?: FinalFormula;
  ocularMotility?: OcularMotility;
  externalExam?: ExternalExam;
  cftaMoscopia?: CftaMoscopia;
  keratometry?: Keratometry;
  colorTest?: ColorTest;
  stereopsisTest?: StereopsisTest;
  refraction?: Refraction;
  subjectiveRefraction?: SubjectiveRefraction;
}

export interface EvolutionPoint {
  consultationId: string;
  date: string;
  od: {
    sphere: number | null;
    cylinder: number | null;
    axis: number | null;
    scVision: string | null;
    ccVision: string | null;
  };
  oi: {
    sphere: number | null;
    cylinder: number | null;
    axis: number | null;
    scVision: string | null;
    ccVision: string | null;
  };
}
