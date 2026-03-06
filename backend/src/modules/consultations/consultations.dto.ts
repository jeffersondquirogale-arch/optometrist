import { z } from 'zod';

// Clinical value ranges
// Sphere/Cylinder: typically -30 to +30 diopters
const sphereCylRange = z
  .number()
  .min(-30, 'El valor de esfera/cilindro debe estar entre -30 y +30 D')
  .max(30, 'El valor de esfera/cilindro debe estar entre -30 y +30 D');
// Axis: 0–180 degrees
const axisRange = z
  .number()
  .int('El eje debe ser un número entero')
  .min(0, 'El eje debe estar entre 0 y 180°')
  .max(180, 'El eje debe estar entre 0 y 180°');
// Add: 0–4 diopters (common presbyopia range)
const addRange = z
  .number()
  .min(0, 'La adición debe estar entre 0 y 4 D')
  .max(4, 'La adición debe estar entre 0 y 4 D');

const lensometrySchema = z.object({
  odSphere: sphereCylRange.optional(),
  odCylinder: sphereCylRange.optional(),
  odAxis: axisRange.optional(),
  odAdd: addRange.optional(),
  oiSphere: sphereCylRange.optional(),
  oiCylinder: sphereCylRange.optional(),
  oiAxis: axisRange.optional(),
  oiAdd: addRange.optional(),
  notes: z.string().max(1000).optional(),
});

const visualAcuitySchema = z.object({
  odScVision: z.string().max(20).optional(),
  oiScVision: z.string().max(20).optional(),
  odCcVision: z.string().max(20).optional(),
  oiCcVision: z.string().max(20).optional(),
  nearVision: z.string().max(20).optional(),
  colorVision: z.string().max(50).optional(),
  iop: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

const finalFormulaSchema = z.object({
  odSphere: sphereCylRange.optional(),
  odCylinder: sphereCylRange.optional(),
  odAxis: axisRange.optional(),
  odAdd: addRange.optional(),
  odPrism: z.string().max(30).optional(),
  oiSphere: sphereCylRange.optional(),
  oiCylinder: sphereCylRange.optional(),
  oiAxis: axisRange.optional(),
  oiAdd: addRange.optional(),
  oiPrism: z.string().max(30).optional(),
  lensType: z.string().max(100).optional(),
  lensMaterial: z.string().max(100).optional(),
  lensCoating: z.string().max(100).optional(),
  dpOd: z.number().min(20, 'DP debe ser entre 20 y 40 mm').max(40, 'DP debe ser entre 20 y 40 mm').optional(),
  dpOi: z.number().min(20, 'DP debe ser entre 20 y 40 mm').max(40, 'DP debe ser entre 20 y 40 mm').optional(),
  notes: z.string().max(1000).optional(),
});

const ocularMotilitySchema = z.object({
  versions: z.string().max(200).optional(),
  ductions: z.string().max(200).optional(),
  coverTest: z.string().max(200).optional(),
  hirschberg: z.string().max(200).optional(),
  npc: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

const externalExamSchema = z.object({
  eyelids: z.string().max(200).optional(),
  conjunctiva: z.string().max(200).optional(),
  cornea: z.string().max(200).optional(),
  iris: z.string().max(200).optional(),
  pupil: z.string().max(200).optional(),
  lens: z.string().max(200).optional(),
  fundus: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

const cftaMoscopiaSchema = z.object({
  campimetry: z.string().max(200).optional(),
  tonometry: z.string().max(200).optional(),
  ascan: z.string().max(200).optional(),
  floaters: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

// Keratometry: K values typically 36–52 D
const keratometrySchema = z.object({
  odK1: z.number().min(30, 'Valor K fuera del rango clínico (30–60 D)').max(60, 'Valor K fuera del rango clínico (30–60 D)').optional(),
  odK1Axis: axisRange.optional(),
  odK2: z.number().min(30, 'Valor K fuera del rango clínico (30–60 D)').max(60, 'Valor K fuera del rango clínico (30–60 D)').optional(),
  odK2Axis: axisRange.optional(),
  oiK1: z.number().min(30, 'Valor K fuera del rango clínico (30–60 D)').max(60, 'Valor K fuera del rango clínico (30–60 D)').optional(),
  oiK1Axis: axisRange.optional(),
  oiK2: z.number().min(30, 'Valor K fuera del rango clínico (30–60 D)').max(60, 'Valor K fuera del rango clínico (30–60 D)').optional(),
  oiK2Axis: axisRange.optional(),
  notes: z.string().max(1000).optional(),
});

const colorTestSchema = z.object({
  odResult: z.string().max(100).optional(),
  oiResult: z.string().max(100).optional(),
  testType: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

const stereopsisTestSchema = z.object({
  result: z.string().max(100).optional(),
  testType: z.string().max(100).optional(),
  seconds: z.number().int().min(0, 'Los segundos de arco no pueden ser negativos').optional(),
  notes: z.string().max(1000).optional(),
});

const refractionSchema = z.object({
  odSphere: sphereCylRange.optional(),
  odCylinder: sphereCylRange.optional(),
  odAxis: axisRange.optional(),
  oiSphere: sphereCylRange.optional(),
  oiCylinder: sphereCylRange.optional(),
  oiAxis: axisRange.optional(),
  notes: z.string().max(1000).optional(),
});

const subjectiveRefractionSchema = z.object({
  odSphere: sphereCylRange.optional(),
  odCylinder: sphereCylRange.optional(),
  odAxis: axisRange.optional(),
  odAdd: addRange.optional(),
  odVision: z.string().max(20).optional(),
  oiSphere: sphereCylRange.optional(),
  oiCylinder: sphereCylRange.optional(),
  oiAxis: axisRange.optional(),
  oiAdd: addRange.optional(),
  oiVision: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

export const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'El ID del paciente es obligatorio'),
  doctorId: z.string().min(1, 'El ID del doctor es obligatorio'),
  appointmentId: z.string().optional(),
  consultationDate: z
    .string()
    .refine(
      (v) => !v || !isNaN(new Date(v).getTime()),
      { message: 'La fecha de consulta no es válida' },
    )
    .optional(),
  reason: z.string().max(500, 'El motivo no puede superar los 500 caracteres').optional(),
  diagnosis: z.string().max(1000, 'El diagnóstico no puede superar los 1000 caracteres').optional(),
  treatment: z.string().max(1000, 'El tratamiento no puede superar los 1000 caracteres').optional(),
  control: z.string().max(500, 'El control no puede superar los 500 caracteres').optional(),
  observations: z.string().max(2000, 'Las observaciones no pueden superar los 2000 caracteres').optional(),
  paymentStatus: z
    .enum(['PENDIENTE', 'PAGADO', 'PARCIAL', 'ANULADO'], {
      errorMap: () => ({ message: 'Estado de pago no válido' }),
    })
    .optional(),
  paymentAmount: z
    .number()
    .min(0, 'El monto no puede ser negativo')
    .optional(),
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
