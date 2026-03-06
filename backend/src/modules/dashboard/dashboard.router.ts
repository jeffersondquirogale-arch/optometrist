import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', dashboardController.getSummary);
dashboardRouter.get('/recent-patients', dashboardController.getRecentPatients);
dashboardRouter.get('/recent-consultations', dashboardController.getRecentConsultations);
dashboardRouter.get('/today-appointments', dashboardController.getTodayAppointments);
dashboardRouter.get('/upcoming-appointments', dashboardController.getUpcomingAppointments);
