import mongoose, { Schema, type InferSchemaType } from "mongoose";

const formResponseSchema = new Schema(
  {
    form_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    answers: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => new Map(),
    },
    started_at: {
      type: Date,
      default: Date.now,
    },
    last_saved_at: {
      type: Date,
      default: Date.now,
    },
    submitted_at: {
      type: Date,
      default: null,
    },
  },
  {
    // Use a clean collection name
    collection: "form_responses",
  }
);

export type FormResponseDoc = InferSchemaType<typeof formResponseSchema>;

export const FormResponse = mongoose.model("FormResponse", formResponseSchema);
