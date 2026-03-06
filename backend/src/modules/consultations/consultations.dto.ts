import { z } from 'zod';

const lensometrySchema = z.object({
  odSphere: z.number().optional(),
  odCylinder: z.number().optional(),
  odAxis: z.number().int().optional(),
  odAdd: z.number().optional(),
  oiSphere: z.number().optional(),
  oiCylinder: z.number().optional(),
  oiAxis: z.number().int().optional(),
  oiAdd: z.number().optional(),
  notes: z.string().optional(),
});

const visualAcuitySchema = z.object({
  odScVision: z.string().optional(),
  oiScVision: z.string().optional(),
  odCcVision: z.string().optional(),
  oiCcVision: z.string().optional(),
  nearVision: z.string().optional(),
  colorVision: z.string().optional(),
  iop: z.string().optional(),
  notes: z.string().optional(),
});

const finalFormulaSchema = z.object({
  odSphere: z.number().optional(),
  odCylinder: z.number().optional(),
  odAxis: z.number().int().optional(),
  odAdd: z.number().optional(),
  odPrism: z.string().optional(),
  oiSphere: z.number().optional(),
  oiCylinder: z.number().optional(),
  oiAxis: z.number().int().optional(),
  oiAdd: z.number().optional(),
  oiPrism: z.string().optional(),
  lensType: z.string().optional(),
  lensMaterial: z.string().optional(),
  lensCoating: z.string().optional(),
  dpOd: z.number().optional(),
  dpOi: z.number().optional(),
  notes: z.string().optional(),
});

const ocularMotilitySchema = z.object({
  versions: z.string().optional(),
  ductions: z.string().optional(),
  coverTest: z.string().optional(),
  hirschberg: z.string().optional(),
  npc: z.string().optional(),
  notes: z.string().optional(),
});

const externalExamSchema = z.object({
  eyelids: z.string().optional(),
  conjunctiva: z.string().optional(),
  cornea: z.string().optional(),
  iris: z.string().optional(),
  pupil: z.string().optional(),
  lens: z.string().optional(),
  fundus: z.string().optional(),
  notes: z.string().optional(),
});

const cftaMoscopiaSchema = z.object({
  campimetry: z.string().optional(),
  tonometry: z.string().optional(),
  ascan: z.string().optional(),
  floaters: z.string().optional(),
  notes: z.string().optional(),
});

const keratometrySchema = z.object({
  odK1: z.number().optional(),
  odK1Axis: z.number().int().optional(),
  odK2: z.number().optional(),
  odK2Axis: z.number().int().optional(),
  oiK1: z.number().optional(),
  oiK1Axis: z.number().int().optional(),
  oiK2: z.number().optional(),
  oiK2Axis: z.number().int().optional(),
  notes: z.string().optional(),
});

const colorTestSchema = z.object({
  odResult: z.string().optional(),
  oiResult: z.string().optional(),
  testType: z.string().optional(),
  notes: z.string().optional(),
});

const stereopsisTestSchema = z.object({
  result: z.string().optional(),
  testType: z.string().optional(),
  seconds: z.number().int().optional(),
  notes: z.string().optional(),
});

const refractionSchema = z.object({
  odSphere: z.number().optional(),
  odCylinder: z.number().optional(),
  odAxis: z.number().int().optional(),
  oiSphere: z.number().optional(),
  oiCylinder: z.number().optional(),
  oiAxis: z.number().int().optional(),
  notes: z.string().optional(),
});

const subjectiveRefractionSchema = z.object({
  odSphere: z.number().optional(),
  odCylinder: z.number().optional(),
  odAxis: z.number().int().optional(),
  odAdd: z.number().optional(),
  odVision: z.string().optional(),
  oiSphere: z.number().optional(),
  oiCylinder: z.number().optional(),
  oiAxis: z.number().int().optional(),
  oiAdd: z.number().optional(),
  oiVision: z.string().optional(),
  notes: z.string().optional(),
});

export const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es obligatorio'),
  doctorId: z.string().min(1, 'El ID del doctor es obligatorio'),
  appointmentId: z.string().optional(),
  consultationDate: z.string().datetime().optional(),
  reason: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  control: z.string().optional(),
  observations: z.string().optional(),
  paymentStatus: z.enum(['PENDIENTE', 'PAGADO', 'PARCIAL', 'ANULADO']).optional(),
  paymentAmount: z.number().optional(),
  // Nested clinical data
  lensometry: lensometrySchema.optional(),
  visualAcuity: visualAcuitySchema.optional(),
  finalFormula: finalFormulaSchema.optional(),
  ocularMotility: ocularMotilitySchema.optional(),
  externalExam: externalExamSchema.optional(),
  cftaMoscopia: cftaMoscopiaSchema.optional(),
  keratometry: keratometrySchema.optional(),
  colorTest: colorTestSchema.optional(),
  stereopsisTest: stereopsisTestSchema.optional(),
  refraction: refractionSchema.optional(),
  subjectiveRefraction: subjectiveRefractionSchema.optional(),
});

export type CreateConsultationDto = z.infer<typeof createConsultationSchema>;
