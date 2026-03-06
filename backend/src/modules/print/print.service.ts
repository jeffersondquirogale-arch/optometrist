import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';

export async function getConsultationForPrint(consultationId: string) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: {
      patient: true,
      doctor: {
        include: { user: { select: { name: true } } },
      },
      lensometry: true,
      visualAcuity: true,
      finalFormula: true,
      ocularMotility: true,
      externalExam: true,
      cftaMoscopia: true,
      keratometry: true,
      colorTest: true,
      stereopsisTest: true,
      refraction: true,
      subjectiveRefraction: true,
      pathologies: true,
    },
  });
  if (!consultation) throw new AppError('Consulta no encontrada', 404);
  return consultation;
}
