import { Router } from 'express';
import { getPatientEvolution } from './charts.controller';

export const chartsRouter = Router();

chartsRouter.get('/patients/:patientId/evolution', getPatientEvolution);
