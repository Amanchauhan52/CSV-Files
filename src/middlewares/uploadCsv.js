import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";

import AppError from "../utils/AppError.js";

const uploadDir = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "text/csv",
  "application/csv",
  "text/comma-separated-values",
  "application/vnd.ms-excel",
  "text/plain",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isCsv = ext === ".csv" && allowedMimeTypes.has(file.mimetype);

  if (!isCsv) {
    return cb(new AppError("Only CSV files are allowed", 400));
  }

  cb(null, true);
};

const uploadCsv = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadCsv;
