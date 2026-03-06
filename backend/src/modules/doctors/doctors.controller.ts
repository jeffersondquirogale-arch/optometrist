import { Request, Response } from 'express';
import * as doctorsService from './doctors.service';
import { createDoctorSchema } from './doctors.dto';
import { AppError } from '../../middlewares/error.middleware';

export async function getAll(_req: Request, res: Response) {
  const doctors = await doctorsService.getAllDoctors();
  res.json({ data: doctors });
}

export async function getOne(req: Request, res: Response) {
  const doctor = await doctorsService.getDoctorById(req.params.id);
  res.json({ data: doctor });
}

export async function create(req: Request, res: Response) {
  const parsed = createDoctorSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  const doctor = await doctorsService.createDoctor(parsed.data);
  res.status(201).json({ data: doctor });
}

export async function update(req: Request, res: Response) {
  const parsed = createDoctorSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  const doctor = await doctorsService.updateDoctor(req.params.id, parsed.data);
  res.json({ data: doctor });
}
