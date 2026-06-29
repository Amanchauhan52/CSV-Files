import "../config/env.js";

import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { QueueEvents, Worker } from "bullmq";

import connectDB from "../config/db.js";
import { errorLogger, logger, queueLogger } from "../config/logger.js";
import { createRedisConnection } from "../config/redis.js";
import FailedCsvRow from "../models/FailedCsvRow.js";
import ImportJob from "../models/ImportJob.js";
import ProcessedCsvRow from "../models/ProcessedCsvRow.js";
import { queueName, queuePrefix } from "../queues/import.queue.js";
import validateCsvRow from "../utils/validateCsvRow.js";

const connection = createRedisConnection();
const eventsConnection = createRedisConnection();

const updateJobCounters = async (jobId, counters) => {
  await ImportJob.updateOne({ jobId }, { $inc: counters });
};

const processCsvJob = async (job) => {
  const { jobId, filename, filePath } = job.data;
  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }

  queueLogger.info("Starting CSV job %s for file %s", jobId, filename);

  await ImportJob.findOneAndUpdate(
    { jobId },
    {
      status: "processing",
      startedAt: new Date(),
      completedAt: null,
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
    }
  );

  const fileStream = fs.createReadStream(absoluteFilePath);
  const csvStream = fileStream.pipe(csvParser());

  let rowNumber = 0;

  try {
    for await (const row of csvStream) {
      rowNumber += 1;

      const { normalizedRow, validationErrors, isValid } = validateCsvRow(row);

      if (isValid) {
        await ProcessedCsvRow.create({
          jobId,
          rowNumber,
          rowData: normalizedRow,
        });

        await updateJobCounters(jobId, {
          totalRows: 1,
          successRows: 1,
        });
      } else {
        await FailedCsvRow.create({
          jobId,
          rowNumber,
          rowData: normalizedRow,
          validationErrors,
        });

        await updateJobCounters(jobId, {
          totalRows: 1,
          failedRows: 1,
        });
      }
    }

    await ImportJob.findOneAndUpdate(
      { jobId },
      {
        status: "completed",
        completedAt: new Date(),
      }
    );

    queueLogger.info(
      "Completed CSV job %s with %d processed rows",
      jobId,
      rowNumber
    );

    return {
      message: "CSV import processed successfully",
      jobId,
      filename,
      totalRows: rowNumber,
    };
  } catch (error) {
    errorLogger.error(`CSV job ${jobId} failed`, {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    fileStream.destroy();
  }
};

const attachRedisEventHandlers = (redisConnection, label) => {
  redisConnection.on("connect", () => {
    queueLogger.info("%s connected", label);
  });

  redisConnection.on("ready", () => {
    queueLogger.info("%s ready", label);
  });

  redisConnection.on("reconnecting", () => {
    queueLogger.warn("%s reconnecting", label);
  });

  redisConnection.on("end", () => {
    queueLogger.warn("%s connection ended", label);
  });

  redisConnection.on("close", () => {
    queueLogger.warn("%s connection closed", label);
  });

  redisConnection.on("error", (error) => {
    errorLogger.error(`${label} error`, { error: error.message });
  });
};

const startWorker = async () => {
  await connectDB();
  attachRedisEventHandlers(connection, "Worker Redis");
  attachRedisEventHandlers(eventsConnection, "QueueEvents Redis");

  const worker = new Worker(queueName, processCsvJob, {
    connection,
    prefix: queuePrefix,
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  });

  const queueEvents = new QueueEvents(queueName, {
    connection: eventsConnection,
    prefix: queuePrefix,
  });

  worker.on("completed", (job) => {
    queueLogger.info("BullMQ job %s completed", job.id);
  });

  worker.on("failed", async (job, error) => {
    const attempts = job?.opts?.attempts || 1;
    const attemptsMade = job?.attemptsMade || 0;
    const failedReason = error?.message || job?.failedReason || "Unknown failure";

    errorLogger.error(`BullMQ job ${job?.id} failed attempt ${attemptsMade}/${attempts}`, {
      failedReason,
    });

    if (job?.data?.jobId && attemptsMade >= attempts) {
      await ImportJob.findOneAndUpdate(
        { jobId: job.data.jobId },
        {
          status: "failed",
          completedAt: new Date(),
        }
      );
    }
  });

  worker.on("error", (error) => {
    errorLogger.error("Worker error", { error: error.message });
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    errorLogger.error(`Queue event failed for job ${jobId}`, { failedReason });
  });

  queueEvents.on("completed", ({ jobId }) => {
    queueLogger.info("Queue event completed for job %s", jobId);
  });

  queueEvents.on("error", (error) => {
    errorLogger.error("Queue events error", { error: error.message });
  });

  logger.info("Worker started and waiting for jobs");
};

startWorker().catch((error) => {
  errorLogger.error("Failed to start worker", error);
  process.exit(1);
});
