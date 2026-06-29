import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import apiRoutes from "./routes/index.js";
import swaggerSpec from "./docs/swagger.js";
import { apiLogger } from "./config/logger.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(
    process.env.NODE_ENV === "production" ? "combined" : "dev",
    {
      stream: {
        write: (message) => {
          apiLogger.info(message.trim());
        },
      },
    }
  )
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
