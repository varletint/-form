import express from "express";
import {
  initFormResponse,
  autoSaveDraft,
  submitForm,
} from "../controllers/responseController";

const router = express.Router();

router.post("/", initFormResponse);
router.patch("/:id", autoSaveDraft);
router.post("/:id/submit", submitForm);

export default router;
