import { Request, Response } from 'express';
import * as patientsService from './patients.service';
import { createPatientSchema } from './patients.dto';
import { validate } from '../../utils/validate';

export async function getAll(req: Request, res: Response) {
  const search = typeof req.query.q === 'string' ? req.query.q : undefined;
  const patients = await patientsService.getAllPatients(search);
  res.json({ data: patients });
}

export async function getOne(req: Request, res: Response) {
  const patient = await patientsService.getPatientById(req.params.id);
  res.json({ data: patient });
}

export async function create(req: Request, res: Response) {
  const data = validate(createPatientSchema, req.body);
  const patient = await patientsService.createPatient(data);
  res.status(201).json({ data: patient });
}

export async function update(req: Request, res: Response) {
  const data = validate(createPatientSchema.partial(), req.body);
  const patient = await patientsService.updatePatient(req.params.id, data);
  res.json({ data: patient });
}

export async function remove(req: Request, res: Response) {
  await patientsService.deletePatient(req.params.id);
  res.status(204).send();
}
