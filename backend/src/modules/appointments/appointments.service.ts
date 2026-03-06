import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateAppointmentDto } from './appointments.dto';

export async function getAllAppointments(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.dateFrom || filters?.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (filters.dateFrom) dateFilter.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.lte = to;
    }
    where.scheduledAt = dateFilter;
  }
  return prisma.appointment.findMany({
    where,
    include: { patient: true },
    orderBy: { scheduledAt: 'desc' },
  });
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!appointment) throw new AppError('Cita no encontrada', 404);
  return appointment;
}

export async function createAppointment(data: CreateAppointmentDto) {
  return prisma.appointment.create({
    data,
    include: { patient: true },
  });
}

export async function updateAppointment(id: string, data: Partial<CreateAppointmentDto>) {
  await getAppointmentById(id);
  return prisma.appointment.update({
    where: { id },
    data,
    include: { patient: true },
  });
}
