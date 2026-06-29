import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";

const queueName = process.env.QUEUE_NAME || "csv-import";
const queuePrefix = process.env.QUEUE_PREFIX || "csv-import";
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: Number(process.env.QUEUE_BACKOFF_DELAY || 5000),
  },
  removeOnComplete: {
    age: Number(process.env.QUEUE_REMOVE_ON_COMPLETE_AGE || 86400),
    count: Number(process.env.QUEUE_REMOVE_ON_COMPLETE_COUNT || 1000),
  },
  removeOnFail: {
    age: Number(process.env.QUEUE_REMOVE_ON_FAIL_AGE || 604800),
  },
};

const connection = createRedisConnection();

const importQueue = new Queue(queueName, {
  connection,
  prefix: queuePrefix,
  defaultJobOptions,
});

export {
  importQueue,
  queueName,
  queuePrefix,
  defaultJobOptions,
};
