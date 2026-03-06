import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateConsultationDto } from './consultations.dto';

// Full include for consultation queries
const fullConsultationInclude = {
  patient: true,
  doctor: { include: { user: { select: { name: true } } } },
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
  eyeDiagram: true,
  pathologies: true,
  medicalNotes: true,
} as const;

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
    include: fullConsultationInclude,
  });
  if (!consultation) throw new AppError('Consulta no encontrada', 404);
  return consultation;
}

// Helper to build nested upsert/create data for related clinical models
function buildNestedClinicalData(data: CreateConsultationDto) {
  const {
    lensometry,
    visualAcuity,
    finalFormula,
    ocularMotility,
    externalExam,
    cftaMoscopia,
    keratometry,
    colorTest,
    stereopsisTest,
    refraction,
    subjectiveRefraction,
    ...base
  } = data;

  return {
    base,
    lensometry,
    visualAcuity,
    finalFormula,
    ocularMotility,
    externalExam,
    cftaMoscopia,
    keratometry,
    colorTest,
    stereopsisTest,
    refraction,
    subjectiveRefraction,
  };
}

export async function createConsultation(data: CreateConsultationDto, userId?: string) {
  const {
    base,
    lensometry,
    visualAcuity,
    finalFormula,
    ocularMotility,
    externalExam,
    cftaMoscopia,
    keratometry,
    colorTest,
    stereopsisTest,
    refraction,
    subjectiveRefraction,
  } = buildNestedClinicalData(data);

  const consultation = await prisma.consultation.create({
    data: {
      ...base,
      ...(lensometry && { lensometry: { create: lensometry } }),
      ...(visualAcuity && { visualAcuity: { create: visualAcuity } }),
      ...(finalFormula && { finalFormula: { create: finalFormula } }),
      ...(ocularMotility && { ocularMotility: { create: ocularMotility } }),
      ...(externalExam && { externalExam: { create: externalExam } }),
      ...(cftaMoscopia && { cftaMoscopia: { create: cftaMoscopia } }),
      ...(keratometry && { keratometry: { create: keratometry } }),
      ...(colorTest && { colorTest: { create: colorTest } }),
      ...(stereopsisTest && { stereopsisTest: { create: stereopsisTest } }),
      ...(refraction && { refraction: { create: refraction } }),
      ...(subjectiveRefraction && { subjectiveRefraction: { create: subjectiveRefraction } }),
    },
    include: fullConsultationInclude,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action: 'CREATE',
      entity: 'Consultation',
      entityId: consultation.id,
      newValues: data as object,
    },
  });

  return consultation;
}

export async function updateConsultation(
  id: string,
  data: Partial<CreateConsultationDto>,
  userId?: string,
) {
  const existing = await getConsultationById(id);

  const {
    lensometry,
    visualAcuity,
    finalFormula,
    ocularMotility,
    externalExam,
    cftaMoscopia,
    keratometry,
    colorTest,
    stereopsisTest,
    refraction,
    subjectiveRefraction,
    ...base
  } = data;

  const consultation = await prisma.consultation.update({
    where: { id },
    data: {
      ...base,
      ...(lensometry !== undefined && {
        lensometry: {
          upsert: { create: lensometry, update: lensometry },
        },
      }),
      ...(visualAcuity !== undefined && {
        visualAcuity: {
          upsert: { create: visualAcuity, update: visualAcuity },
        },
      }),
      ...(finalFormula !== undefined && {
        finalFormula: {
          upsert: { create: finalFormula, update: finalFormula },
        },
      }),
      ...(ocularMotility !== undefined && {
        ocularMotility: {
          upsert: { create: ocularMotility, update: ocularMotility },
        },
      }),
      ...(externalExam !== undefined && {
        externalExam: {
          upsert: { create: externalExam, update: externalExam },
        },
      }),
      ...(cftaMoscopia !== undefined && {
        cftaMoscopia: {
          upsert: { create: cftaMoscopia, update: cftaMoscopia },
        },
      }),
      ...(keratometry !== undefined && {
        keratometry: {
          upsert: { create: keratometry, update: keratometry },
        },
      }),
      ...(colorTest !== undefined && {
        colorTest: {
          upsert: { create: colorTest, update: colorTest },
        },
      }),
      ...(stereopsisTest !== undefined && {
        stereopsisTest: {
          upsert: { create: stereopsisTest, update: stereopsisTest },
        },
      }),
      ...(refraction !== undefined && {
        refraction: {
          upsert: { create: refraction, update: refraction },
        },
      }),
      ...(subjectiveRefraction !== undefined && {
        subjectiveRefraction: {
          upsert: { create: subjectiveRefraction, update: subjectiveRefraction },
        },
      }),
    },
    include: fullConsultationInclude,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action: 'UPDATE',
      entity: 'Consultation',
      entityId: id,
      oldValues: existing as object,
      newValues: data as object,
    },
  });

  return consultation;
}

export async function getConsultationHistoryByPatient(patientId: string) {
  return prisma.consultation.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      lensometry: true,
      visualAcuity: true,
      finalFormula: true,
    },
    orderBy: { consultationDate: 'desc' },
  });
}

export async function getConsultationEvolutionByPatient(patientId: string) {
  const consultations = await prisma.consultation.findMany({
    where: { patientId },
    select: {
      id: true,
      consultationDate: true,
      finalFormula: {
        select: {
          odSphere: true,
          odCylinder: true,
          odAxis: true,
          oiSphere: true,
          oiCylinder: true,
          oiAxis: true,
        },
      },
      visualAcuity: {
        select: {
          odScVision: true,
          oiScVision: true,
          odCcVision: true,
          oiCcVision: true,
        },
      },
    },
    orderBy: { consultationDate: 'asc' },
  });

  return consultations.map((c) => ({
    consultationId: c.id,
    date: c.consultationDate,
    od: {
      sphere: c.finalFormula?.odSphere ?? null,
      cylinder: c.finalFormula?.odCylinder ?? null,
      axis: c.finalFormula?.odAxis ?? null,
      scVision: c.visualAcuity?.odScVision ?? null,
      ccVision: c.visualAcuity?.odCcVision ?? null,
    },
    oi: {
      sphere: c.finalFormula?.oiSphere ?? null,
      cylinder: c.finalFormula?.oiCylinder ?? null,
      axis: c.finalFormula?.oiAxis ?? null,
      scVision: c.visualAcuity?.oiScVision ?? null,
      ccVision: c.visualAcuity?.oiCcVision ?? null,
    },
  }));
}
