import { z } from 'zod';

export const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es obligatorio'),
  doctorId: z.string().min(1, 'El ID del doctor es obligatorio'),
  appointmentId: z.string().optional(),
  consultationDate: z.string().datetime().optional(),
  reason: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  observations: z.string().optional(),
  paymentStatus: z.enum(['PENDIENTE', 'PAGADO', 'PARCIAL', 'ANULADO']).optional(),
  paymentAmount: z.number().optional(),
});

export type CreateConsultationDto = z.infer<typeof createConsultationSchema>;
