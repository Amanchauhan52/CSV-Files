import multer from "multer";
import { errorLogger } from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "CSV file is too large";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      statusCode = 400;
      message = "Only one CSV file is allowed";
    } else {
      statusCode = 400;
      message = err.message || "Invalid upload request";
    }
  }

  errorLogger.error("API error", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export {
  errorHandler,
};
