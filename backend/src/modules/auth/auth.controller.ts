import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema } from './auth.dto';
import { AppError } from '../../middlewares/error.middleware';

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 400);
  }
  const result = await authService.login(parsed.data);
  res.json({ data: result });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.json({ data: user });
}
