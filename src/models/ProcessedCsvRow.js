import mongoose from "mongoose";

const processedCsvRowSchema = new mongoose.Schema(
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model("ProcessedCsvRow", processedCsvRowSchema);
