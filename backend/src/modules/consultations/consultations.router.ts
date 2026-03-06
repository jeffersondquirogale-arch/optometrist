import { Router } from 'express';
import * as consultationsController from './consultations.controller';

export const consultationsRouter = Router();

consultationsRouter.get('/', consultationsController.getAll);
consultationsRouter.get('/:id', consultationsController.getOne);
consultationsRouter.post('/', consultationsController.create);
consultationsRouter.patch('/:id', consultationsController.update);
