import { z } from "zod";

// MongoDB ObjectId is a 24-char hex string
const objectIdString = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Must be a valid ObjectId" });

// POST /api/mongo/responses — Initialize a new form response
export const mongoInitFormResponseSchema = z.object({
  form_id: objectIdString.optional(),
});

// PATCH /api/mongo/responses/:id — Auto-save draft answers
export const mongoAutoSaveDraftSchema = z.object({
  answers: z
    .record(z.string(), z.unknown())
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "answers must be a non-empty object",
    }),
});

// POST /api/mongo/responses/:id/submit — Validate route params
export const mongoSubmitFormParamsSchema = z.object({
  id: objectIdString,
});

// Validates the stored draft answers before final submission
export const mongoFormAnswersSchema = z
  .record(z.string(), z.unknown())
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Cannot submit a form with empty answers",
  });

// Inferred types
export type MongoInitFormResponseBody = z.infer<
  typeof mongoInitFormResponseSchema
>;
export type MongoAutoSaveDraftBody = z.infer<typeof mongoAutoSaveDraftSchema>;
export type MongoSubmitFormParams = z.infer<typeof mongoSubmitFormParamsSchema>;
