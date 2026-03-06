import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { env } from '../../config/env';
import { LoginDto } from './auth.dto';

export async function login(data: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.active) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const signOptions: jwt.SignOptions = { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] };
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, signOptions);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  if (!user || !user.active) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return user;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}
