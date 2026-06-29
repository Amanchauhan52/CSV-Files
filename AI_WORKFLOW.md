# AI Workflow

## AI Tools Used

- OpenAI Codex

## Development Prompt Log

The following prompts were used during development. They are kept here as a reference log, not as a summary.

### 1. CSV Upload API

```text
Create CSV upload API using multer in Express.js.

Requirements:
- Accept only CSV files
- Store files inside uploads folder
- File size validation
- Proper error handling
- Return uploaded file path
- Generate unique filenames
```

### 2. CSV Import Job API

```text
Create POST /import API for CSV upload processing.

Requirements:
- Upload CSV file
- Store job in MongoDB
- Generate unique job ID
- Add job into BullMQ queue
- Return immediate response with:
  - jobId
  - status
- Use async/await
- Proper error handling
```

### 3. Import Job Schema

```text
Create MongoDB Mongoose schema for CSV import jobs.

Fields:
- jobId
- filename
- status
- totalRows
- successRows
- failedRows
- startedAt
- completedAt
- createdAt

Allowed statuses:
- queued
- processing
- completed
- failed
```

### 4. Failed Row Schema

```text
Create Mongoose schema for failed CSV rows.

Fields:
- jobId
- rowNumber
- rowData
- validationErrors
- createdAt

Store validation errors properly.
```

### 5. CSV Worker

```text
Create BullMQ worker for CSV processing.

Requirements:
- Read CSV files using csv-parser
- Process row by row
- Validate rows
- Save valid rows into MongoDB
- Save failed rows separately
- Update job status dynamically
- Handle large CSV files efficiently
- Use streams for memory optimization
```

### 6. Reusable Validation Logic

```text
Create reusable CSV row validation logic.

Required fields:
- name
- email
- age
- department

Validation:
- name required
- email valid format
- age must be numeric
- department required

Return validation errors array.
```

### 7. Job Status API

```text
Create GET /jobs/:id API.

Requirements:
- Return job processing status
- Return:
  - total rows
  - successful rows
  - failed rows
  - processing state
- Proper error handling
- Return 404 if job not found
```

### 8. Failed Rows API

```text
Create GET /jobs/:id/errors API.

Requirements:
- Return all failed rows
- Include validation error messages
- Include row number
- Add pagination support
- Proper error handling
```

### 9. BullMQ Retry Handling

```text
Add retry and failure handling in BullMQ worker.

Requirements:
- Retry failed jobs 3 times
- Exponential backoff
- Log failed job reasons
- Update MongoDB job status on failure
- Handle Redis disconnect properly
```

### 10. Swagger Setup

```text
Create Swagger documentation setup for Express.js backend.

Requirements:
- swagger-jsdoc
- swagger-ui-express
- /api-docs route
- Document all APIs:
  - POST /import
  - GET /jobs/:id
  - GET /jobs/:id/errors
- Include request and response schemas
```


### 11. Winston Logger

```text
Add Winston logger in Node.js backend.

Requirements:
- Separate error logs
- Queue processing logs
- API logs
- File logging
- Console logging
- Production-ready logger setup
```




