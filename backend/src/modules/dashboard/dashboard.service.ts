import { prisma } from '../../config/prisma';

/** Estadísticas resumidas para el dashboard */
export async function getSummary() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    totalPatients,
    todayAppointmentsCount,
    upcomingAppointmentsCount,
    appointmentsByStatus,
    recentConsultationsCount,
  ] = await Promise.all([
    prisma.patient.count({ where: { active: true } }),
    prisma.appointment.count({
      where: { scheduledAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: { gt: endOfDay },
        status: { notIn: ['CANCELADA', 'COMPLETADA', 'NO_ASISTIO'] },
      },
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.consultation.count({
      where: {
        consultationDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of appointmentsByStatus) {
    statusCounts[row.status] = row._count.status;
  }

  return {
    totalPatients,
    todayAppointmentsCount,
    upcomingAppointmentsCount,
    recentConsultationsCount,
    appointmentsByStatus: statusCounts,
  };
}

/** Pacientes registrados recientemente */
export async function getRecentPatients(limit = 5) {
  return prisma.patient.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      documentId: true,
      phone: true,
      createdAt: true,
    },
  });
}

/** Consultas realizadas recientemente */
export async function getRecentConsultations(limit = 5) {
  return prisma.consultation.findMany({
    orderBy: { consultationDate: 'desc' },
    take: limit,
    select: {
      id: true,
      consultationDate: true,
      reason: true,
      diagnosis: true,
      paymentStatus: true,
      patient: {
        select: { id: true, firstName: true, lastName: true },
      },
      doctor: {
        select: {
          id: true,
          specialty: true,
          user: { select: { name: true } },
        },
      },
    },
  });
}

/** Citas de hoy */
export async function getTodayAppointments() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: { scheduledAt: { gte: startOfDay, lte: endOfDay } },
    orderBy: { scheduledAt: 'asc' },
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  });
}

/** Próximas citas (a partir de mañana, excluyendo canceladas/completadas) */
export async function getUpcomingAppointments(limit = 5) {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: {
      scheduledAt: { gt: endOfDay },
      status: { notIn: ['CANCELADA', 'COMPLETADA', 'NO_ASISTIO'] },
    },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  });
}
