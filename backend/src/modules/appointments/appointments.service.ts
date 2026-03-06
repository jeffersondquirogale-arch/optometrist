import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateAppointmentDto } from './appointments.dto';

export async function getAllAppointments() {
  return prisma.appointment.findMany({
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
