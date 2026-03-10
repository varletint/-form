import { FormResponse } from "../../db/mongodb/models/FormResponse.js";
import type { Request, Response } from "express";
import { mongoFormAnswersSchema } from "../../schemas/mongoResponseSchemas.js";

// 1. Initialize a new form session
export const initFormResponse = async (req: Request, res: Response) => {
  try {
    const { form_id } = req.body;

    const doc = await FormResponse.create({
      form_id: form_id || null,
      status: "draft",
      answers: {},
    });

    res.status(201).json({
      id: doc._id,
      status: doc.status,
      answers: Object.fromEntries(doc.answers),
      started_at: doc.started_at,
    });
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

    // Build a $set object that merges new answers into the existing map
    const setFields: Record<string, unknown> = { last_saved_at: new Date() };
    for (const [key, value] of Object.entries(
      answers as Record<string, unknown>
    )) {
      setFields[`answers.${key}`] = value;
    }

    const doc = await FormResponse.findOneAndUpdate(
      { _id: id, status: "draft" },
      { $set: setFields },
      { new: true }
    );

    if (!doc) {
      return res
        .status(404)
        .json({ error: "Draft not found or already submitted" });
    }

    res.status(200).json({
      id: doc._id,
      answers: Object.fromEntries(doc.answers),
      last_saved_at: doc.last_saved_at,
    });
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
    const draft = await FormResponse.findOne({ _id: id, status: "draft" });

    if (!draft) {
      return res.status(404).json({
        error: "Draft not found or already submitted.",
      });
    }

    // Validate the stored answers with Zod before allowing submission
    const answersObj = Object.fromEntries(draft.answers);
    const validation = mongoFormAnswersSchema.safeParse(answersObj);

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
    draft.status = "submitted";
    draft.submitted_at = new Date();
    await draft.save();

    res.status(200).json({
      message: "Form submitted successfully!",
      data: {
        id: draft._id,
        status: draft.status,
        submitted_at: draft.submitted_at,
      },
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
