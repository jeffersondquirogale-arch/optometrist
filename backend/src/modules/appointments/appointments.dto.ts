import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es obligatorio'),
  scheduledAt: z.string().datetime(),
  reason: z.string().optional(),
  status: z
    .enum(['PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'])
    .optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
