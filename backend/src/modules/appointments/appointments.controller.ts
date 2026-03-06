import { Request, Response } from 'express';
import * as appointmentsService from './appointments.service';
import { createAppointmentSchema } from './appointments.dto';
import { AppError } from '../../middlewares/error.middleware';

export async function getAll(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
  const appointments = await appointmentsService.getAllAppointments({ status, dateFrom, dateTo });
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
