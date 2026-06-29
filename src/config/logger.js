import fs from "fs";
import path from "path";
import winston from "winston";

const logsDir = path.join(process.cwd(), "logs");

fs.mkdirSync(logsDir, { recursive: true });

const isProduction = process.env.NODE_ENV === "production";

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat()
);

const fileFormat = winston.format.combine(baseFormat, winston.format.json());

const consoleFormat = winston.format.combine(
  baseFormat,
  isProduction ? winston.format.json() : winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const payload = stack || message;
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

    return `${timestamp} ${level}: ${payload}${extra}`;
  })
);

const createCategoryLogger = ({ level = "info", fileName }) =>
  winston.createLogger({
    level,
    format: baseFormat,
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, "combined.log"),
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, fileName),
        level,
        format: fileFormat,
      }),
    ],
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, "exceptions.log"),
        format: fileFormat,
      }),
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, "rejections.log"),
        format: fileFormat,
      }),
    ],
  });

const logger = createCategoryLogger({
  fileName: "app.log",
});

const apiLogger = createCategoryLogger({
  fileName: "api.log",
});

const queueLogger = createCategoryLogger({
  fileName: "queue.log",
});

const errorLogger = createCategoryLogger({
  level: "error",
  fileName: "error.log",
});

export {
  logger,
  apiLogger,
  queueLogger,
  errorLogger,
};
