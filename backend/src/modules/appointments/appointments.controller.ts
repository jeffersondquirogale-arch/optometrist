import { Request, Response } from 'express';
import * as appointmentsService from './appointments.service';
import { createAppointmentSchema } from './appointments.dto';
import { validate } from '../../utils/validate';

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
  const data = validate(createAppointmentSchema, req.body);
  const appointment = await appointmentsService.createAppointment(data);
  res.status(201).json({ data: appointment });
}

export async function update(req: Request, res: Response) {
  const data = validate(createAppointmentSchema.partial(), req.body);
  const appointment = await appointmentsService.updateAppointment(req.params.id, data);
  res.json({ data: appointment });
}
