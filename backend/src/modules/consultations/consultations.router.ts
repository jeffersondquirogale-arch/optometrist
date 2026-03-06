import { Router } from 'express';
import * as consultationsController from './consultations.controller';

export const consultationsRouter = Router();

// Patient-scoped routes (must come before /:id to avoid conflicts)
consultationsRouter.get('/patient/:patientId/history', consultationsController.getPatientHistory);
consultationsRouter.get(
  '/patient/:patientId/evolution',
  consultationsController.getPatientEvolution,
);

consultationsRouter.get('/', consultationsController.getAll);
consultationsRouter.get('/:id', consultationsController.getOne);
consultationsRouter.post('/', consultationsController.create);
consultationsRouter.put('/:id', consultationsController.update);
consultationsRouter.patch('/:id', consultationsController.update);
