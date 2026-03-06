import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreatePatientDto } from './patients.dto';

export async function getAllPatients() {
  return prisma.patient.findMany({
    where: { active: true },
    orderBy: { lastName: 'asc' },
  });
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) throw new AppError('Paciente no encontrado', 404);
  return patient;
}

export async function createPatient(data: CreatePatientDto) {
  return prisma.patient.create({ data });
}

export async function updatePatient(id: string, data: Partial<CreatePatientDto>) {
  await getPatientById(id);
  return prisma.patient.update({ where: { id }, data });
}

export async function deletePatient(id: string) {
  await getPatientById(id);
  return prisma.patient.update({ where: { id }, data: { active: false } });
}
