import { Request, Response } from 'express';
import { getConsultationEvolutionByPatient } from '../consultations/consultations.service';

export async function getPatientEvolution(req: Request, res: Response) {
  const evolution = await getConsultationEvolutionByPatient(req.params.patientId);
  res.json({ data: evolution });
}
