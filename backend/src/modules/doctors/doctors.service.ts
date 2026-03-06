import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateDoctorDto } from './doctors.dto';

export async function getAllDoctors() {
  return prisma.doctorProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!doctor) throw new AppError('Doctor no encontrado', 404);
  return doctor;
}

export async function createDoctor(data: CreateDoctorDto) {
  return prisma.doctorProfile.create({ data });
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorDto>) {
  await getDoctorById(id);
  return prisma.doctorProfile.update({ where: { id }, data });
}
