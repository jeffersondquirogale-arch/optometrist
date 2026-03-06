import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  documentId: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['MASCULINO', 'FEMENINO', 'OTRO']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;
