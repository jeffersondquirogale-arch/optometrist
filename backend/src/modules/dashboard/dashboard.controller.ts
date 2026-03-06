import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function getSummary(_req: Request, res: Response) {
  const data = await dashboardService.getSummary();
  res.json({ data });
}

export async function getRecentPatients(_req: Request, res: Response) {
  const data = await dashboardService.getRecentPatients();
  res.json({ data });
}

export async function getRecentConsultations(req: Request, res: Response) {
  const role = req.user?.role;
  // STAFF no tiene acceso a detalles clínicos de consultas
  if (role === 'STAFF') {
    res.json({ data: [] });
    return;
  }
  const data = await dashboardService.getRecentConsultations();
  res.json({ data });
}

export async function getTodayAppointments(_req: Request, res: Response) {
  const data = await dashboardService.getTodayAppointments();
  res.json({ data });
}

export async function getUpcomingAppointments(_req: Request, res: Response) {
  const data = await dashboardService.getUpcomingAppointments();
  res.json({ data });
}
