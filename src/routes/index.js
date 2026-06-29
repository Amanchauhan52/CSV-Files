import express from "express";
import { getJobById, getJobErrors, importCsv } from "../controllers/importController.js";
import uploadCsv from "../middlewares/uploadCsv.js";
import importRoutes from "./importRoutes.js";

const router = express.Router();

router.post("/import", uploadCsv.single("file"), importCsv);
router.get("/jobs/:id", getJobById);
router.get("/jobs/:id/errors", getJobErrors);
router.use("/imports", importRoutes);

export default router;
