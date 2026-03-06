import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
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

// ─── Rate limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Demasiados intentos. Intente nuevamente en 15 minutos.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Demasiadas solicitudes. Intente nuevamente más tarde.' },
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Auth (rutas públicas) ────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);

// ─── Rutas protegidas ─────────────────────────────────────────────────────────
app.use('/api/patients', apiLimiter, authMiddleware, patientsRouter);
app.use('/api/doctors', apiLimiter, authMiddleware, doctorsRouter);
app.use('/api/consultations', apiLimiter, authMiddleware, consultationsRouter);
app.use('/api/appointments', apiLimiter, authMiddleware, appointmentsRouter);
app.use('/api/print', apiLimiter, authMiddleware, printRouter);
app.use('/api/charts', apiLimiter, authMiddleware, chartsRouter);

// ─── Middlewares de error ─────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
