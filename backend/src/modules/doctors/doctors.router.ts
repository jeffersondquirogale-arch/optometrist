import { Router } from 'express';
import * as doctorsController from './doctors.controller';

export const doctorsRouter = Router();

doctorsRouter.get('/', doctorsController.getAll);
doctorsRouter.get('/:id', doctorsController.getOne);
doctorsRouter.post('/', doctorsController.create);
doctorsRouter.patch('/:id', doctorsController.update);
