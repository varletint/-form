import db from "../../db/postgres/index.js";
import type { Request, Response } from "express";
import { formAnswersSchema } from "../../schemas/responseSchemas.js";

// 1. Initialize a new form session
export const initFormResponse = async (req: Request, res: Response) => {
  try {
    const { form_id } = req.body;

    const result = await db.query(
      `INSERT INTO form_responses (form_id, status, answers)
       VALUES ($1, 'draft', '{}'::jsonb)
       RETURNING id, status, answers, started_at`,
      [form_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error initializing form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 2. Auto-save incoming draft data
export const autoSaveDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const result = await db.query(
      `UPDATE form_responses 
       SET answers = answers || $1::jsonb, 
           last_saved_at = NOW() 
       WHERE id = $2 AND status = 'draft'
       RETURNING id, answers, last_saved_at`,
      [JSON.stringify(answers), id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Draft not found or already submitted" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error auto-saving:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 3. Final Form Submission — fetches draft answers and validates them with Zod
export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the current draft and its answers from the database
    const draft = await db.query(
      `SELECT id, answers FROM form_responses WHERE id = $1 AND status = 'draft'`,
      [id]
    );

    if (draft.rowCount === 0) {
      return res.status(404).json({
        error: "Draft not found or already submitted.",
      });
    }

    // Validate the stored answers with Zod before allowing submission
    const validation = formAnswersSchema.safeParse(draft.rows[0]?.answers);

    if (!validation.success) {
      return res.status(400).json({
        error: "Form answers failed validation",
        details: validation.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Validation passed — mark as submitted
    const result = await db.query(
      `UPDATE form_responses 
       SET status = 'submitted', 
           submitted_at = NOW() 
       WHERE id = $1 AND status = 'draft'
       RETURNING id, status, submitted_at`,
      [id]
    );

    res
      .status(200)
      .json({ message: "Form submitted successfully!", data: result.rows[0] });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
