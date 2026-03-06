import { Router } from 'express';
import * as printController from './print.controller';

export const printRouter = Router();

printRouter.get('/consultations/:consultationId', printController.getConsultationForPrint);
