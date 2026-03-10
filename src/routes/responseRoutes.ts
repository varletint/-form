import express from "express";
import {
  initFormResponse,
  autoSaveDraft,
  submitForm,
} from "../controllers/postgres/responseController.js";
import { validate } from "../middleware/validate.js";
import {
  initFormResponseSchema,
  autoSaveDraftSchema,
  submitFormParamsSchema,
} from "../schemas/responseSchemas.js";

const router = express.Router();

router.post("/", validate(initFormResponseSchema, "body"), initFormResponse);
router.patch("/:id", validate(autoSaveDraftSchema, "body"), autoSaveDraft);
router.post(
  "/:id/submit",
  validate(submitFormParamsSchema, "params"),
  submitForm
);

export default router;
