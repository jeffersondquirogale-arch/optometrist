import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  public readonly errors: { field: string; message: string }[];

  constructor(errors: { field: string; message: string }[]) {
    super(errors[0]?.message ?? 'Error de validación', 400);
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[] | undefined) ?? [];
      res.status(409).json({
        status: 'error',
        message: `Ya existe un registro con el mismo valor en: ${fields.join(', ')}`,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'error',
        message: 'Registro no encontrado',
      });
      return;
    }
  }

  console.error('Error no controlado:', err);

  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
}
