import { Request, Response } from 'express';
import * as consultationsService from './consultations.service';
import { createConsultationSchema } from './consultations.dto';
import { validate } from '../../utils/validate';

export async function getAll(req: Request, res: Response) {
  const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
  const consultations = await consultationsService.getAllConsultations(patientId);
  res.json({ data: consultations });
}

export async function getOne(req: Request, res: Response) {
  const consultation = await consultationsService.getConsultationById(req.params.id);
  res.json({ data: consultation });
}

export async function create(req: Request, res: Response) {
  const data = validate(createConsultationSchema, req.body);
  const consultation = await consultationsService.createConsultation(data, req.user?.id);
  res.status(201).json({ data: consultation });
}

export async function update(req: Request, res: Response) {
  const data = validate(createConsultationSchema.partial(), req.body);
  const consultation = await consultationsService.updateConsultation(
    req.params.id,
    data,
    req.user?.id,
  );
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
