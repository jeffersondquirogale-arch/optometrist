import { Router } from 'express';
import * as consultationsController from './consultations.controller';
import { requireRole } from '../../middlewares/auth.middleware';

export const consultationsRouter = Router();

// Patient-scoped routes (must come before /:id to avoid conflicts)
consultationsRouter.get('/patient/:patientId/history', requireRole('ADMIN', 'DOCTOR', 'STAFF'), consultationsController.getPatientHistory);
consultationsRouter.get(
  '/patient/:patientId/evolution',
  requireRole('ADMIN', 'DOCTOR', 'STAFF'),
  consultationsController.getPatientEvolution,
);

consultationsRouter.get('/', requireRole('ADMIN', 'DOCTOR', 'STAFF'), consultationsController.getAll);
consultationsRouter.get('/:id', requireRole('ADMIN', 'DOCTOR', 'STAFF'), consultationsController.getOne);
consultationsRouter.post('/', requireRole('ADMIN', 'DOCTOR'), consultationsController.create);
consultationsRouter.put('/:id', requireRole('ADMIN', 'DOCTOR'), consultationsController.update);
consultationsRouter.patch('/:id', requireRole('ADMIN', 'DOCTOR'), consultationsController.update);
