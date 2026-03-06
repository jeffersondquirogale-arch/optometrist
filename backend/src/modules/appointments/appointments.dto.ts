import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es obligatorio'),
  scheduledAt: z
    .string()
    .min(1, 'La fecha y hora de la cita es obligatoria')
    .refine(
      (v) => !isNaN(new Date(v).getTime()),
      { message: 'La fecha y hora de la cita no es válida' },
    ),
  reason: z
    .string()
    .max(500, 'El motivo no puede superar los 500 caracteres')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'], {
      errorMap: () => ({ message: 'Estado de cita no válido' }),
    })
    .optional(),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden superar los 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
