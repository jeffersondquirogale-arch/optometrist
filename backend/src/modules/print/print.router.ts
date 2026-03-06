import { Router } from 'express';
import * as printController from './print.controller';
import { requireRole } from '../../middlewares/auth.middleware';

export const printRouter = Router();

printRouter.get('/consultations/:consultationId', requireRole('ADMIN', 'DOCTOR'), printController.getConsultationForPrint);
