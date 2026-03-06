import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema } from './auth.dto';
import { validate } from '../../utils/validate';

export async function login(req: Request, res: Response) {
  const data = validate(loginSchema, req.body);
  const result = await authService.login(data);
  res.json({ data: result });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.json({ data: user });
}
