import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/db.js";
import { logger, errorLogger } from "./config/logger.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info("Server running on port %s", PORT);
    });
  } catch (error) {
    errorLogger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
