import IORedis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
};

const createRedisConnection = () => {
  return new IORedis({
    ...redisConfig,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
};

export {
  redisConfig,
  createRedisConnection,
};
