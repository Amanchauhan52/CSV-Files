import { randomUUID } from "crypto";
import path from "path";

import AppError from "../utils/AppError.js";
import { importQueue } from "../queues/import.queue.js";
import ImportJob from "../models/ImportJob.js";

const createImportJob = async ({ file }) => {
  if (!file) {
    throw new AppError("CSV file is required", 400);
  }

  const jobId = randomUUID();
  const filePath = path.posix.join("uploads", file.filename);

  const dbJob = await ImportJob.create({
    jobId,
    filename: file.originalname,
    status: "queued",
  });

  try {
    await importQueue.add(
      "process-csv",
      {
        jobId: dbJob.jobId,
        filename: dbJob.filename,
        filePath,
      },
      {
        jobId: dbJob.jobId,
      }
    );
  } catch (error) {
    await ImportJob.findByIdAndUpdate(dbJob._id, {
      status: "failed",
    });

    throw new AppError("Failed to queue CSV import job", 500);
  }

  return {
    jobId: dbJob.jobId,
    status: dbJob.status,
  };
};

export {
  createImportJob,
};
