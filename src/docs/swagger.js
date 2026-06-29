import path from "path";
import { fileURLToPath } from "url";

import swaggerJsdoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "CSV Import Processing API",
    version: "1.0.0",
    description: "Swagger documentation for the CSV import processing backend.",
  },
  servers: [
    {
      url: "/api",
      description: "API base path",
    },
  ],
  components: {
    schemas: {
      ImportJobResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "CSV import job queued successfully",
          },
          data: {
            type: "object",
            properties: {
              jobId: {
                type: "string",
                example: "b7d7b7c3-4b72-4f3e-8a2d-7c6d3e6f0b31",
              },
              status: { type: "string", example: "queued" },
            },
          },
        },
      },
      JobStatusResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              jobId: {
                type: "string",
                example: "b7d7b7c3-4b72-4f3e-8a2d-7c6d3e6f0b31",
              },
              processingState: { type: "string", example: "processing" },
              totalRows: { type: "number", example: 125 },
              successfulRows: { type: "number", example: 120 },
              failedRows: { type: "number", example: 5 },
              startedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              completedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
            },
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          field: { type: "string", nullable: true, example: "email" },
          message: { type: "string", example: "Email format is invalid" },
          value: { nullable: true, example: "bad-email" },
          code: { type: "string", example: "INVALID_EMAIL" },
        },
      },
      FailedRowItem: {
        type: "object",
        properties: {
          rowNumber: { type: "number", example: 3 },
          rowData: {
            type: "object",
            additionalProperties: true,
          },
          validationErrors: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ValidationError",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      JobErrorsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              jobId: {
                type: "string",
                example: "b7d7b7c3-4b72-4f3e-8a2d-7c6d3e6f0b31",
              },
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/FailedRowItem",
                },
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number", example: 1 },
                  limit: { type: "number", example: 10 },
                  total: { type: "number", example: 5 },
                  totalPages: { type: "number", example: 1 },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Job not found" },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [path.join(__dirname, "swagger.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * @openapi
 * /import:
 *   post:
 *     summary: Upload and queue a CSV import job
 *     tags:
 *       - Import Jobs
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to upload
 *     responses:
 *       "202":
 *         description: Job queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ImportJobResponse"
 *       "400":
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

/**
 * @openapi
 * /jobs/{id}:
 *   get:
 *     summary: Get current processing status for a job
 *     tags:
 *       - Import Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       "200":
 *         description: Job status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JobStatusResponse"
 *       "404":
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

/**
 * @openapi
 * /jobs/{id}/errors:
 *   get:
 *     summary: Get failed rows for a job
 *     tags:
 *       - Import Jobs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       "200":
 *         description: Failed rows for the job
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/JobErrorsResponse"
 *       "404":
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

export default swaggerSpec;
