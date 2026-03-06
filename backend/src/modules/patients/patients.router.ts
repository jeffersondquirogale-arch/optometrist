import { Router } from 'express';
import * as patientsController from './patients.controller';
import { requireRole } from '../../middlewares/auth.middleware';

export const patientsRouter = Router();

patientsRouter.get('/', patientsController.getAll);
patientsRouter.get('/:id', patientsController.getOne);
patientsRouter.post('/', requireRole('ADMIN', 'STAFF'), patientsController.create);
patientsRouter.patch('/:id', requireRole('ADMIN', 'STAFF'), patientsController.update);
patientsRouter.delete('/:id', requireRole('ADMIN'), patientsController.remove);
