import mongoose from "mongoose";

const validationErrorSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      trim: true,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    code: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const failedCsvRowSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    rowNumber: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    rowData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    validationErrors: {
      type: [validationErrorSchema],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("FailedCsvRow", failedCsvRowSchema);
