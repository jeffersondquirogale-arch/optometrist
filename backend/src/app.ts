import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';
import { authMiddleware } from './middlewares/auth.middleware';

// Importar routers de módulos
import { authRouter } from './modules/auth/auth.router';
import { patientsRouter } from './modules/patients/patients.router';
import { doctorsRouter } from './modules/doctors/doctors.router';
import { consultationsRouter } from './modules/consultations/consultations.router';
import { appointmentsRouter } from './modules/appointments/appointments.router';
import { printRouter } from './modules/print/print.router';
import { chartsRouter } from './modules/charts/charts.router';

const app = express();

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Auth (rutas públicas) ────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Rutas protegidas ─────────────────────────────────────────────────────────
app.use('/api/patients', authMiddleware, patientsRouter);
app.use('/api/doctors', authMiddleware, doctorsRouter);
app.use('/api/consultations', authMiddleware, consultationsRouter);
app.use('/api/appointments', authMiddleware, appointmentsRouter);
app.use('/api/print', authMiddleware, printRouter);
app.use('/api/charts', authMiddleware, chartsRouter);

// ─── Middlewares de error ─────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
