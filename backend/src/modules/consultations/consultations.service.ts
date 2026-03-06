import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateConsultationDto } from './consultations.dto';

export async function getAllConsultations() {
  return prisma.consultation.findMany({
    include: {
      patient: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { consultationDate: 'desc' },
  });
}

export async function getConsultationById(id: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: { include: { user: { select: { name: true } } } },
      lensometry: true,
      visualAcuity: true,
      finalFormula: true,
    },
  });
  if (!consultation) throw new AppError('Consulta no encontrada', 404);
  return consultation;
}

export async function createConsultation(data: CreateConsultationDto) {
  return prisma.consultation.create({
    data,
    include: {
      patient: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
}

export async function updateConsultation(id: string, data: Partial<CreateConsultationDto>) {
  await getConsultationById(id);
  return prisma.consultation.update({
    where: { id },
    data,
    include: {
      patient: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
}
