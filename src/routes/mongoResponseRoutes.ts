import express from "express";
import {
  initFormResponse,
  autoSaveDraft,
  submitForm,
} from "../controllers/mongodb/responseController.js";
import { validate } from "../middleware/validate.js";
import {
  mongoInitFormResponseSchema,
  mongoAutoSaveDraftSchema,
  mongoSubmitFormParamsSchema,
} from "../schemas/mongoResponseSchemas.js";

const router = express.Router();

router.post(
  "/",
  validate(mongoInitFormResponseSchema, "body"),
  initFormResponse
);
router.patch("/:id", validate(mongoAutoSaveDraftSchema, "body"), autoSaveDraft);
router.post(
  "/:id/submit",
  validate(mongoSubmitFormParamsSchema, "params"),
  submitForm
);

export default router;
