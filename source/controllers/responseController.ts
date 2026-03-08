import db from "../db";
import type { Request, Response } from "express";

// 1. Initialize a new form sessio
export const initFormResponse = async (req: Request, res: Response) => {
  try {
    // We assume form_id is passed, though for testing you could hardcode a generic one
    const { form_id } = req.body;

    // Create a blank draft response
    const result = await db.query(
      `INSERT INTO form_responses (form_id, status, answers)
       VALUES ($1, 'draft', '{}'::jsonb)
       RETURNING id, status, answers, started_at`,
      [form_id || null] // null if testing without forms table
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

    // The || operator merges new JSON into existing JSON in Postgres
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

// 3. Final Form Submission
export const submitForm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // In a real app, you would fetch the draft JSON here and run it through Zod validation!

    // If validation passes, mark as submitted
    const result = await db.query(
      `UPDATE form_responses 
       SET status = 'submitted', 
           submitted_at = NOW() 
       WHERE id = $1 AND status = 'draft'
       RETURNING id, status, submitted_at`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "Cannot submit. Draft not found or already submitted.",
      });
    }

    res
      .status(200)
      .json({ message: "Form submitted successfully!", data: result.rows[0] });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
