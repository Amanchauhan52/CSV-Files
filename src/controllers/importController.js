import AppError from "../utils/AppError.js";
import FailedCsvRow from "../models/FailedCsvRow.js";
import ImportJob from "../models/ImportJob.js";
import { createImportJob } from "../services/importService.js";
import asyncHandler from "../utils/asyncHandler.js";

const importCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a CSV file", 400);
  }

  const job = await createImportJob({ file: req.file });

  res.status(202).json({
    success: true,
    message: "CSV import job queued successfully",
    data: job,
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const job = await ImportJob.findOne({ jobId: id }).lean();

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      jobId: job.jobId,
      processingState: job.status,
      totalRows: job.totalRows,
      successfulRows: job.successRows,
      failedRows: job.failedRows,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    },
  });
});

const getJobErrors = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const job = await ImportJob.findOne({ jobId: id }).select("jobId").lean();

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const [items, total] = await Promise.all([
    FailedCsvRow.find({ jobId: id })
      .sort({ rowNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FailedCsvRow.countDocuments({ jobId: id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      jobId: id,
      items: items.map((item) => ({
        rowNumber: item.rowNumber,
        rowData: item.rowData,
        validationErrors: item.validationErrors,
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export {
  importCsv,
  getJobById,
  getJobErrors,
  importCsv as enqueueImport,
};
