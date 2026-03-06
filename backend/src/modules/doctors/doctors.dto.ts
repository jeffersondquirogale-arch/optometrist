import { z } from 'zod';

export const createDoctorSchema = z.object({
  licenseNumber: z.string().min(1, 'El número de licencia es obligatorio'),
  specialty: z.string().optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().optional(),
  userId: z.string().min(1, 'El ID de usuario es obligatorio'),
});

export type CreateDoctorDto = z.infer<typeof createDoctorSchema>;
