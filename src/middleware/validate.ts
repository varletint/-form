import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

/**
 * Generic validation middleware factory.
 *
 * @param schema  - The Zod schema to validate against
 * @param source  - Which part of the request to validate ('body' | 'params' | 'query')
 *
 * @example
 * router.post("/", validate(mySchema, "body"), myController);
 */
export const validate =
  (schema: ZodSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    // Replace the raw data with the parsed & cleaned data
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
