# CSV Import Processing System

## Project Overview

This is a Node.js backend for CSV import processing built with Express.js, MongoDB, Redis, and BullMQ.

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and update the environment values.

3. Make sure MongoDB and Redis are available locally or through Docker.

## Run Commands

```bash
redis-server  
npm run dev
npm run worker
```
Swagger link

http://localhost:3000/api-docs

## Redis Setup

Redis is used by BullMQ for queue processing.

Local Redis settings are defined in `.env` using:

```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

When running with Docker, Redis is available through the `redis` service name in `docker-compose.yml`.

## Database Setup

MongoDB stores import jobs, processed rows, and failed rows.

Local MongoDB settings are defined in `.env` using:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/assignment
```

