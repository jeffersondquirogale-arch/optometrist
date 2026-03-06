import { Request, Response } from 'express';
import * as appointmentsService from './appointments.service';
import { createAppointmentSchema } from './appointments.dto';
import { AppError } from '../../middlewares/error.middleware';

export async function getAll(_req: Request, res: Response) {
  const appointments = await appointmentsService.getAllAppointments();
  res.json({ data: appointments });
}

export async function getOne(req: Request, res: Response) {
  const appointment = await appointmentsService.getAppointmentById(req.params.id);
  res.json({ data: appointment });
}

export async function create(req: Request, res: Response) {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  const appointment = await appointmentsService.createAppointment(parsed.data);
  res.status(201).json({ data: appointment });
}

export async function update(req: Request, res: Response) {
  const parsed = createAppointmentSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  const appointment = await appointmentsService.updateAppointment(req.params.id, parsed.data);
  res.json({ data: appointment });
}
