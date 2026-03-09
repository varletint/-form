import { z } from "zod";

// POST /api/responses — Initialize a new form response
export const initFormResponseSchema = z.object({
  form_id: z
    .string()
    .uuid({ error: "form_id must be a valid UUID" })
    .optional(),
});

// PATCH /api/responses/:id — Auto-save draft answers
export const autoSaveDraftSchema = z.object({
  answers: z
    .record(z.string(), z.unknown())
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "answers must be a non-empty object",
    }),
});

// POST /api/responses/:id/submit — Validate route params
export const submitFormParamsSchema = z.object({
  id: z.string().uuid({ error: "id must be a valid UUID" }),
});

// Validates the stored draft answers before final submission
export const formAnswersSchema = z
  .record(z.string(), z.unknown())
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Cannot submit a form with empty answers",
  });

// Inferred types for use in controllers
export type InitFormResponseBody = z.infer<typeof initFormResponseSchema>;
export type AutoSaveDraftBody = z.infer<typeof autoSaveDraftSchema>;
export type SubmitFormParams = z.infer<typeof submitFormParamsSchema>;
