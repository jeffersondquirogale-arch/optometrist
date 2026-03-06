import { ZodSchema } from 'zod';
import { ValidationError } from '../middlewares/error.middleware';

/**
 * Parse and validate a request body against a Zod schema.
 * Throws ValidationError with all field errors if validation fails.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.') || 'body',
      message: e.message,
    }));
    throw new ValidationError(errors);
  }
  return result.data;
}
