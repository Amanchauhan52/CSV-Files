import express from "express";
import { enqueueImport } from "../controllers/importController.js";
import { uploadCsvFile } from "../controllers/uploadController.js";
import uploadCsv from "../middlewares/uploadCsv.js";

const router = express.Router();

router.post("/enqueue", enqueueImport);
router.post("/upload-csv", uploadCsv.single("file"), uploadCsvFile);

export default router;
