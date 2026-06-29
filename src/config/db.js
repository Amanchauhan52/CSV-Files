import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI (or MONGODB_URI) is not defined");
  }

  await mongoose.connect(uri);
  logger.info("MongoDB connected");
};

export default connectDB;
