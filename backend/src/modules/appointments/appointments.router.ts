import { Router } from 'express';
import * as appointmentsController from './appointments.controller';

export const appointmentsRouter = Router();

appointmentsRouter.get('/', appointmentsController.getAll);
appointmentsRouter.get('/:id', appointmentsController.getOne);
appointmentsRouter.post('/', appointmentsController.create);
appointmentsRouter.patch('/:id', appointmentsController.update);
