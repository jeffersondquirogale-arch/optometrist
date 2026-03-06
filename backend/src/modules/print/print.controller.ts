import { Request, Response } from 'express';
import * as printService from './print.service';

export async function getConsultationForPrint(req: Request, res: Response) {
  const consultation = await printService.getConsultationForPrint(req.params.consultationId);
  res.json({ data: consultation });
}
