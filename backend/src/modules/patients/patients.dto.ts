import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .trim(),
  lastName: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido no puede superar los 100 caracteres')
    .trim(),
  documentId: z
    .string()
    .max(30, 'El documento no puede superar los 30 caracteres')
    .optional()
    .or(z.literal('')),
  birthDate: z
    .string()
    .refine(
      (v) => {
        if (!v) return true;
        const d = new Date(v);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      { message: 'La fecha de nacimiento debe ser una fecha válida y no futura' },
    )
    .optional()
    .or(z.literal('')),
  gender: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']).optional(),
  phone: z.string().max(30, 'El teléfono no puede superar los 30 caracteres').optional().or(z.literal('')),
  email: z
    .string()
    .email('El email no tiene un formato válido')
    .max(150, 'El email no puede superar los 150 caracteres')
    .optional()
    .or(z.literal('')),
  address: z.string().max(200, 'La dirección no puede superar los 200 caracteres').optional().or(z.literal('')),
  occupation: z.string().max(100, 'La ocupación no puede superar los 100 caracteres').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Las observaciones no pueden superar los 1000 caracteres').optional().or(z.literal('')),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;
