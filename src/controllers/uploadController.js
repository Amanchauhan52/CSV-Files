import path from "path";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const uploadCsvFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a CSV file", 400);
  }

  res.status(201).json({
    success: true,
    message: "CSV file uploaded successfully",
    data: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: path.posix.join("uploads", req.file.filename),
      size: req.file.size,
    },
  });
});

export {
  uploadCsvFile,
};
