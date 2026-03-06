import { Router } from 'express';
import * as patientsController from './patients.controller';

export const patientsRouter = Router();

patientsRouter.get('/', patientsController.getAll);
patientsRouter.get('/:id', patientsController.getOne);
patientsRouter.post('/', patientsController.create);
patientsRouter.patch('/:id', patientsController.update);
patientsRouter.delete('/:id', patientsController.remove);
