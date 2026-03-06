import { Request, Response } from 'express';
import * as consultationsService from './consultations.service';
import { createConsultationSchema } from './consultations.dto';
import { AppError } from '../../middlewares/error.middleware';

export async function getAll(_req: Request, res: Response) {
  const consultations = await consultationsService.getAllConsultations();
  res.json({ data: consultations });
}

export async function getOne(req: Request, res: Response) {
  const consultation = await consultationsService.getConsultationById(req.params.id);
  res.json({ data: consultation });
}

export async function create(req: Request, res: Response) {
  const parsed = createConsultationSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  // userId will be populated once authentication middleware is added (Phase 3+)
  const consultation = await consultationsService.createConsultation(parsed.data);
  res.status(201).json({ data: consultation });
}

export async function update(req: Request, res: Response) {
  const parsed = createConsultationSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  // userId will be populated once authentication middleware is added (Phase 3+)
  const consultation = await consultationsService.updateConsultation(req.params.id, parsed.data);
  res.json({ data: consultation });
}

export async function getPatientHistory(req: Request, res: Response) {
  const consultations = await consultationsService.getConsultationHistoryByPatient(
    req.params.patientId,
  );
  res.json({ data: consultations });
}

export async function getPatientEvolution(req: Request, res: Response) {
  const evolution = await consultationsService.getConsultationEvolutionByPatient(
    req.params.patientId,
  );
  res.json({ data: evolution });
}
