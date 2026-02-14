import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./error-handler";

/**
 * Express middleware that validates request body against a Zod schema.
 * Replaces req.body with the parsed (and potentially transformed) value.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      next(new AppError(422, message, "VALIDATION_ERROR"));
      return;
    }
    req.body = result.data;
    next();
  };
}
